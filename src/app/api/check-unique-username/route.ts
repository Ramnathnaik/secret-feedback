import { z } from "zod";
import { usernameValidation } from "../../../schemas/signUpSchema";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { sendResponse } from "@/helper/reponse";

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

    return sendResponse(
      usernameErrors.length > 0
        ? usernameErrors.join(", ")
        : "Invalid query parameters",
      false,
      400
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
      return sendResponse("Username already taken", false, 400);
    }

    return sendResponse("Username is unique", true, 200, "success");
  } catch (error) {
    return sendResponse("Internal server error", false, 500);
  }
}
