import { User, getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { sendResponse } from "@/helper/reponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  const messageId = params.messageId;
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !user) {
    return sendResponse("Not authenticated", false, 401);
  }

  await dbConnect();

  try {
    const updateResponse = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResponse.modifiedCount === 0) {
      sendResponse("Message was not deleted", false, 400);
    } else {
      sendResponse("Message got deleted", true, 200);
    }
  } catch (error) {
    console.log("Error while deleting message: " + error);
    return sendResponse("Unable to delete the message", false, 500);
  }
}
