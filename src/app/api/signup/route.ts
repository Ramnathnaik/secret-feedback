import { sendResponse } from "@/helper/reponse";
import sendVerificationEmail from "@/helper/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  const { username, password, email } = await request.json();

  await dbConnect();

  try {
    const existingUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUser) {
      return sendResponse("Username already exists", false, 400);
    }

    const userWithExistingEmail = await UserModel.findOne({
      email,
    });

    const verifyCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");

    if (userWithExistingEmail) {
      if (userWithExistingEmail.isVerified) {
        return sendResponse("Email already exists", false, 400);
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        userWithExistingEmail.password = hashedPassword;
        userWithExistingEmail.verifyCode = verifyCode;
        userWithExistingEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await userWithExistingEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        password: hashedPassword,
        email,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return sendResponse(emailResponse.message, false, 500);
    }

    return sendResponse(
      "User registered successfully. Please verify your email",
      true,
      201
    );
  } catch (error) {
    console.error(`User not saved due to error: ${error}`);
    return sendResponse(
      "Unable to create user. Please try after sometime",
      false,
      500
    );
  }
}
