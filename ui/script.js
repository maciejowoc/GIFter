const videoSrc = document.querySelector('#videoSource');
const videoTag = document.querySelector("#preview");
const inputTag = document.querySelector("#upload");
const outputTag = document.querySelector('#outputGif');
var finished = true;

function readVideo (event) {
    outputTag.style.display = 'none';
    let file = inputTag.files[0];
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      let fileName = file.name;
      let fileSize = (file.size/1024).toFixed(2);

      reader.onload = function(e) {
        videoSrc.src = e.target.result
        videoTag.load()
      }.bind(this)
  
      reader.readAsDataURL(file);
      //document.querySelector('#movie').style.display = 'block';

      videoTag.addEventListener('loadedmetadata', function() {
        var vHeight = this.videoHeight;
        var vWidth = this.videoWidth;
        if (vHeight > 400) vHeight = 400;
        if (vWidth > 500) vWidth = 500;

        var bitmap = document.querySelector('#workplace');

        bitmap.setAttribute('width',vWidth);
        bitmap.setAttribute('height',vHeight);
        

        const ctx = bitmap.getContext('2d');

        videoTag.muted = true;
        videoTag.loop = false;
        videoTag.play();

        const clrSrc = () => {
          ctx.fillStyle = 'rgba(255,255,255,0)';
          ctx.fillRect(0,0,vWidth,vHeight);
        }

        const encoder = new GIFEncoder(vWidth,vHeight);
        encoder.setRepeat(0);
        encoder.setDelay(0);

        const step = async() => {
          if (!finished) {
            let background = await clrSrc();
            await new Promise(resolve => {
            ctx.drawImage(videoTag,0,0,vWidth,vHeight);
            frameB64Str = bitmap.toDataURL();
            encoder.addFrame(ctx);
            resolve();
          });
          window.requestAnimationFrame(step);
          }
        };

        videoTag.addEventListener('play',() => {
          finished = false;
          encoder.start();
          step();
          window.requestAnimationFrame(step);
        });

        videoTag.addEventListener('ended', () => {
          encoder.finish();
          finished = true;
          let fileType = 'image/gif';
          let readableStream = encoder.stream();
          let binary_gif = readableStream.getData();
          let b64Str = 'data:'+fileType+';base64,'+encode64(binary_gif);

          let dwnlnk = document.createElement('a');
          dwnlnk.download = fileName.replace('.mp4','.gif');
          dwnlnk.innerHTML = `💾 <small>Save</small>`;
          dwnlnk.href = b64Str;
          document.querySelector('#sauce').appendChild(dwnlnk);
          outputTag.setAttribute('src',b64Str);
          outputTag.style.display = 'block';
        });




      }, false)
      
    


    }
  };

  inputTag.addEventListener('change',readVideo);
