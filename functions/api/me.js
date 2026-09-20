import { json } from "../_lib/http.js";
import { requireUser } from "../_lib/auth.js";

export async function onRequestGet(context) {
  const auth = await requireUser(context);
  if (auth.error) return auth.error;

  return json({
    ok: true,
    user: {
      id: auth.user.id,
      username: auth.user.username,
      displayName: auth.user.display_name
    }
  });
}
