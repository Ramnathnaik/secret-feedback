import { z } from "zod";
import { usernameValidation } from "../../../schemas/signUpSchema";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParam = {
    username: searchParams.get("username"),
  };

  const result = usernameQuerySchema.safeParse(queryParam);

  if (!result.success) {
    const usernameErrors = result.error.format().username?._errors || [];

    return Response.json(
      {
        success: false,
        message:
          usernameErrors.length > 0
            ? usernameErrors.join(", ")
            : "Invalid query parameters",
      },
      { status: 400 }
    );
  }

  const { username } = result.data;

  await dbConnect();

  try {
    const existingUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUser) {
      return Response.json(
        {
          status: false,
          message: "Username already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
