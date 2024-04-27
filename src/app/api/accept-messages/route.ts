import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { sendResponse } from "@/helper/reponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(request: Request) {
  const { acceptMessages } = await request.json();

  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !user) {
    return sendResponse("Not authenticated", false, 401);
  }

  const userId = user._id;

  try {
    await dbConnect();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return sendResponse(
        "Unable to update the accept message status",
        false,
        401
      );
    }

    return sendResponse(
      "Accept messages status updated successfully",
      true,
      200,
      "success",
      updatedUser
    );
  } catch (error) {
    console.log("Error while updating accept message status: " + error);
    return sendResponse(
      "Unable to update the accept message status",
      false,
      500
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !user) {
    return sendResponse("Not authenticated", false, 401);
  }

  const userId = user._id;

  try {
    await dbConnect();

    const user = await UserModel.findById(userId);

    if (!user) {
      return sendResponse("User not found", false, 404);
    }

    return sendResponse(
      "Able to fetch the accept message status",
      true,
      200,
      "success",
      user.isAcceptingMessage
    );
  } catch (error) {
    console.log("Error while getting accept message status: " + error);
    return sendResponse(
      "Unable to fetch the accept message status",
      false,
      500
    );
  }
}
