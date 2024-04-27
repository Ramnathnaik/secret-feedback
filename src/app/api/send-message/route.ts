import { sendResponse } from "@/helper/reponse";
import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/User.model";
import { messageSchema } from "@/schemas/messageSchema";

export async function POST(request: Request) {
  const { username, content } = await request.json();

  const result = messageSchema.safeParse({
    content,
  });

  if (!result.success) {
    const messageValidationErrors =
      result.error.format().content?._errors || [];
    return sendResponse(
      messageValidationErrors.length > 0
        ? messageValidationErrors.join(", ")
        : "Error in validating message content",
      false,
      400
    );
  }

  await dbConnect();

  try {
    const foundUser = await UserModel.findOne({
      username,
    });

    if (!foundUser) {
      return sendResponse("User not found", false, 404);
    }

    if (!foundUser.isAcceptingMessage) {
      return sendResponse("User is not accepting message", false, 400);
    }

    foundUser.messages.push({ content, createdAt: new Date() } as Message);
    await foundUser.save();

    return sendResponse("Message sent successfully", true, 200);
  } catch (error) {
    return sendResponse();
  }
}
