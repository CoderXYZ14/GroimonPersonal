import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function GET(req, { params }) {
  const { id } = params;

  await dbConnect();
  try {
    const user = await UserModel.findById(id).populate("automations");

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const response = {
      image: user.image,
      numberOfAutomations: user.automations.length,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Server error", error }), {
      status: 500,
    });
  }
}
