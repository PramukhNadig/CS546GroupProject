async function addFriend(name) {
  // use fetch to post to "friends/add/:id"

  const res = await fetch(`/friends/add/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (data.nowFriends) return true;

  return false;
}

async function addFriendButton() {
  const friendName = window.location.href.split("profile/")[1];
  const textField = document.getElementById("addFriendInput");
  if (!friendName) return;

  const run = await addFriend(friendName);
  if (run) {
    // gray out friend button
    const friendButton = document.getElementById("addFriendButton");
    friendButton.disabled = true;
    friendButton.innerText = "Already friends";
  }
}
