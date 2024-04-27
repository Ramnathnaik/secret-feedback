import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { sendResponse } from "@/helper/reponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import mongoose from "mongoose";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !user) {
    return sendResponse("Not authenticated", false, 401);
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  await dbConnect();

  try {
    const users = await UserModel.aggregate([
      { $match: { id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!users || users.length === 0) {
      return sendResponse("No messages found", false, 400);
    }

    return sendResponse(
      "Messages found",
      true,
      200,
      "success",
      users[0].messages
    );
  } catch (error) {
    console.log("Error while getting messages: " + error);
    return sendResponse("Unable to fetch the messages", false, 500);
  }
}
