 
(function(){
    let senderID;
    const socket=io();
    function generateID(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }
    document.querySelector("#receiver-start-con-btn").addEventListener("click",function(){
        senderID=document.querySelector("#join-id").value;
        if(senderID.length==0){
            return ;  
        }
        let joinID= generateID();
        socket.emit ("receiver-join", { 
            uid: joinID,
            sender_uid:senderID
        });
        document.querySelector(".join-screen").classList.remove("active"); 
        document.querySelector(".fs-screen").classList.add("active");
    });
   
    let fileShare={};
    socket.on("fs-meta",function(metadata){
        fileShare.metadata=metadata;
        fileShare.transmitted=0;
        fileShare.buffer=[];
        let e1=document.createElement("div");
        e1.classList.add("item");
        e1.innerHTML=`
        <div class="progress">0%</div>
        <div class="filename">${metadata.filename}</div>
        `;
        document.querySelector(".files-list").appendChild(e1);
        fileShare.progress_node=e1.querySelector(".progress");
        socket.emit("fs-start",{
            uid:senderID
        })
    })
    socket.on("fs-share",function(buffer){
        fileShare.buffer.push(buffer);
        fileShare.transmitted+=buffer.byteLength;
        fileShare.progress_node.innerText=Math.trunc(fileShare.transmitted/fileShare.metadata.total_buffer_size *100)+"%";
        if(fileShare.transmitted == fileShare.metadata.total_buffer_size){
            download(new Blob(fileShare.buffer),fileShare.metadata.filename);
            fileShare={};
        }
        else{
            socket.emit("fs-start",{
                uid:senderID
            });
        }

    })
    
})();
