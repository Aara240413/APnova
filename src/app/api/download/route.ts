import { execSync } from "child_process";
import { readFileSync } from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Create a zip of the project excluding unnecessary folders
    execSync(
      'cd /app && tar czf /tmp/apnova-project.tar.gz --exclude=node_modules --exclude=.next --exclude=.git .'
    );

    const file = readFileSync("/tmp/apnova-project.tar.gz");

    return new Response(file, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": "attachment; filename=apnova-project.tar.gz",
      },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
