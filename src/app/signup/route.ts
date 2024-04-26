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
      return Response.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );
    }

    const userWithExistingEmail = await UserModel.findOne({
      email,
    });

    const verifyCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");

    if (userWithExistingEmail) {
      if (userWithExistingEmail.isVerified) {
        return Response.json(
          { success: false, message: "Email already exists" },
          { status: 400 }
        );
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
      const verifyCodeExpiry = expiryDate.getHours() + 1;

      const newUser = new UserModel({
        username,
        password: hashedPassword,
        email,
        verifyCode,
        verifyCodeExpiry,
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
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`User not saved due to error: ${error}`);
    return Response.json(
      {
        success: false,
        message: "Unable to create user. Please try after sometime",
      },
      { status: 500 }
    );
  }
}
