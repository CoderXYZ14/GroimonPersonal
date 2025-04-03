import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  await dbConnect();
  try {
    const user = await UserModel.findById(id).populate("automations");

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const response = {
      numberOfAutomations: user.automations.length,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Server error", error }), {
      status: 500,
    });
  }
}
