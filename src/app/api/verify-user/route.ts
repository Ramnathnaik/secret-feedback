import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { verifySchema } from "@/schemas/verifySchema";
export async function POST(request: Request) {
  const { username, code } = await request.json();

  const result = verifySchema.safeParse({
    code,
  });

  if (!result.success) {
    const codeVerificationErrors = result.error.format().code?._errors || [];

    return Response.json(
      {
        success: false,
        message:
          codeVerificationErrors.length > 0
            ? codeVerificationErrors.join(", ")
            : "Invaild code",
      },
      { status: 400 }
    );
  }

  const decodedUsername = decodeURIComponent(username);

  await dbConnect();

  try {
    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const codeExpiryTime = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message: "Code not valid",
        },
        { status: 400 }
      );
    }
    if (!codeExpiryTime) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code expired. Please signup again to generate new code.",
        },
        { status: 400 }
      );
    }

    if (codeExpiryTime && isCodeValid) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Unable to verify code",
      },
      { status: 500 }
    );
  }
}
