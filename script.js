const videoSrc = document.querySelector('#videoSource');
const videoTag = document.querySelector("#preview");
const inputTag = document.querySelector("#upload");
const outputTag = document.querySelector('#outputGif');
const progressBar = document.querySelector('#progressBar');
const dwnlnk = document.querySelector('#download');
const acceptedFileTypes = ['video/mp4','video/wav'];
var finished = true;

function readVideo (event) {
    progressBar.value = 0;
    progressBar.style.display = 'block';
    outputTag.style.display = 'none';
    dwnlnk.style.display = 'none';
    let file = inputTag.files[0];
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      let fileName = file.name;

      reader.onload = function(e) {
        videoSrc.src = e.target.result
        videoTag.load()
      }.bind(this)
  
      reader.readAsDataURL(file);
      if(videoTag.getAttribute('listener') !== 'true'){
        videoTag.addEventListener('loadedmetadata', function() {
          progressBar.max = Math.round(videoTag.duration);
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
          encoder.setQuality(20);
  
          const step = async() => {
            if (!finished) {
              let background = await clrSrc();
              await new Promise(resolve => {
              ctx.drawImage(videoTag,0,0,vWidth,vHeight);
              frameB64Str = bitmap.toDataURL();
              encoder.addFrame(ctx);
              progressBar.value = Math.round(videoTag.currentTime);
              resolve();
            });
            window.requestAnimationFrame(step);
            }
          };
  
          if(videoTag.getAttribute('listener') !== 'true') {
            videoTag.addEventListener('play',() => {
              finished = false;
              encoder.start();
              step();
              window.requestAnimationFrame(step);
            });
          }

          if(videoTag.getAttribute('listener') !== 'true') {
            videoTag.addEventListener('ended', () => {
              encoder.finish();
              finished = true;
              let fileType = 'image/gif';
              let readableStream = encoder.stream();
              let binary_gif = readableStream.getData();
              let b64Str = 'data:'+fileType+';base64,'+encode64(binary_gif);

              dwnlnk.download = inputTag.files[0].name.replace('.mp4','.gif');              
              dwnlnk.href = b64Str;
              dwnlnk.style.display = 'block';
              document.querySelector('#sauce').appendChild(dwnlnk);
              outputTag.setAttribute('src',b64Str);
              outputTag.style.display = 'block';
              progressBar.style.display = 'none';
              delete encoder;
              videoTag.setAttribute('listener','true');
            });
          }
  
        }, false)
      }



    }
  };

inputTag.addEventListener('change',readVideo);

function fileDrop(event) {
  event.stopPropagation();
  event.preventDefault();
  let dt = event.dataTransfer;
  let file = dt.files[0];
  if (!acceptedFileTypes.find(element => element == file.type)) {
    alert('Proszę wgrać akceptowalny format wideo!');
  }
  else {
    inputTag.files = dt.files;
    var event = new Event('change');
    inputTag.dispatchEvent(event);
    console.log('wgrano');
  }
}

function fileHover(event) {
  event.stopPropagation();
  event.preventDefault();
  console.log('Hover');
}

document.addEventListener('dragenter', fileHover);
document.addEventListener('dragover', fileHover);
document.addEventListener('drop', fileDrop);


