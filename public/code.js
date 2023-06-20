(function() {
  let receiverID;
  const socket = io();

  function generateID() {
    return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`;
  }

  document.querySelector("#sender-start-con-btn").addEventListener("click", function() {
    let joinID = generateID();
    const roomIDElement = document.querySelector("#join-id");
    roomIDElement.innerHTML = `
    <div class="room-id">
      <b style="color: #fff;">Room ID:</b>
      <span class="copyable" style="color: #fff; cursor: pointer;">${joinID}</span>
   </div>
      `;
    socket.emit("sender-join", {
      uid: joinID
    });
  });

  // Copy functionality for dynamically generated room ID
  document.addEventListener("click", function(event) {
    const copyableElement = event.target.closest(".copyable");
    if (copyableElement) {
      const roomID = copyableElement.innerText;

      // Create a temporary textarea element to hold the room ID text
      const textarea = document.createElement("textarea");
      textarea.value = roomID;
      document.body.appendChild(textarea);

      // Select the text within the textarea
      textarea.select();
      textarea.setSelectionRange(0, 99999);

      // Copy the selected text to the clipboard
      document.execCommand("copy");

      // Remove the temporary textarea
      document.body.removeChild(textarea);

      // Provide visual feedback or notification that the room ID has been copied
      alert("Room ID copied to clipboard!");
    }
  });

  socket.on("init", function(uid) {
    receiverID = uid;
    document.querySelector(".join-screen").classList.remove("active");
    document.querySelector(".fs-screen").classList.add("active");
  });

  document.querySelector("#file-input").addEventListener("change", function(e) {
    let file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
      let buffer = new Uint8Array(reader.result);
      let e1 = document.createElement("div");
      e1.classList.add("item");
      e1.innerHTML = `
        <div class="progress">0%</div>
        <div class="filename">${file.name}</div>
      `;
      document.querySelector(".files-list").appendChild(e1);
      shareFile({
        filename: file.name,
        total_buffer_size: buffer.length,
        buffer_size: 1024
      }, buffer, e1.querySelector(".progress"));
    };
    reader.readAsArrayBuffer(file);
  });

  function shareFile(metadata, buffer, progress_node) {
    socket.emit("file-meta", {
      uid: receiverID,
      metadata: metadata
    });
    socket.on("fs-share", function() {
      let chunk = buffer.slice(0, metadata.buffer_size);
      buffer = buffer.slice(metadata.buffer_size, buffer.length);
      progress_node.innerText = Math.trunc(((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size) * 100) + "%";
      if (chunk.length !== 0) {
        socket.emit("file-raw", {
          uid: receiverID,
          buffer: chunk
        });
      }
    });
  }
})();
