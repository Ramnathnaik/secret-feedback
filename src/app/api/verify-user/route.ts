import { sendResponse } from "@/helper/reponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
export async function POST(request: Request) {
  const { username, code } = await request.json();

  const result = verifyCodeSchema.safeParse({
    code,
  });

  if (!result.success) {
    const codeVerificationErrors = result.error.format().code?._errors || [];

    return sendResponse(
      codeVerificationErrors.length > 0
        ? codeVerificationErrors.join(", ")
        : "Invaild code",
      false,
      400
    );
  }

  const decodedUsername = decodeURIComponent(username);

  await dbConnect();

  try {
    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    if (!user) {
      return sendResponse("User not found", false, 400);
    }

    const isCodeValid = user.verifyCode === code;
    const codeExpiryTime = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeValid) {
      return sendResponse("Code not vaild", false, 400);
    }
    if (!codeExpiryTime) {
      return sendResponse(
        "Verification code expired. Please signup again to generate new code.",
        false,
        400
      );
    }

    if (codeExpiryTime && isCodeValid) {
      user.isVerified = true;
      await user.save();
      return sendResponse("User verified successfully", true, 200);
    }
  } catch (error) {
    return sendResponse("Unable to verify code", false);
  }
}
