const discordStatusEl = document.getElementById("discord-status");
const discordUserId = "YOUR_USER_ID";

function getAvatarUrl(user) {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  }
  const defaultAvatar = parseInt(user.discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
}

function getActivityImageUrl(activity) {
  if (!activity.assets || !activity.assets.large_image) return null;
  let key = activity.assets.large_image;


  if (activity.name === "Spotify" && key.startsWith("spotify:")) {
    key = key.replace("spotify:", "");
    return `https://i.scdn.co/image/${key}`;
  }


  if (key.startsWith("mp:external/")) {
    key = key.replace("mp:external/", "");
    return `https://${key}`;
  }


  if (!key.startsWith("http")) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${key}.png`;
  }

  return key;
}

async function fetchDiscordData() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    if (!json.success) throw new Error("API Error");

    const user = json.data.discord_user;
    const activities = json.data.activities;

    const primaryActivity = activities.find(act => act.type !== 4) || null;

    let activityName = "";
    let activityDetails = "";
    let activityImgUrl = null;

    if (primaryActivity) {
      activityName = primaryActivity.name || "";
      activityDetails = primaryActivity.details || primaryActivity.state || "";
      activityImgUrl = getActivityImageUrl(primaryActivity);
    }

    discordStatusEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:1rem;">
        <!-- Discord Avatar -->
        <img src="${getAvatarUrl(user)}" alt="Avatar" style="width:48px; height:48px; border-radius:50%;" />
        
        <!-- Username and Activity -->
        <div style="flex-grow:1;">
          <div style="font-weight:600; font-size:1rem;">${user.username}#${user.discriminator}</div>
          <div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.25rem;">
            
            <!-- Activity Image -->
            ${
              activityImgUrl
                ? `<img src="${activityImgUrl}" alt="Activity Image" style="width:32px; height:32px; border-radius:6px; flex-shrink:0;" />`
                : ""
            }

            <!-- Activity Text -->
            <div style="font-size:0.875rem; color:#aaa;">
              <div>${activityName}</div>
              <div>${activityDetails}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch {
    discordStatusEl.textContent = "Failed to load Discord status.";
  }
}

fetchDiscordData();
setInterval(fetchDiscordData, 60000);
