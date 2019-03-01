// require('./login.js');
// import './login';

const addImage = async (urls) => {
  for (let i = 0; i < urls.length; i++) {
    await new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const slides = document.querySelector('.slides');

      img.src = urls[i].url;
      img.alt = urls[i].alt;
      img.title = urls[i].hint;
      img.classList.add('image');

      slides.appendChild(img);

      img.addEventListener('load', () => {
        resolve();
      });
      img.addEventListener('error', () => {
        slides.removeChild(img);
        console.log('image not found');
        const span = document.createElement('span');
        span.innerHTML= 'Не удалось<br>загрузить картинку';
        span.style="padding: 20px; color: red; display: inline-flex; justify-content: center; align-items: center;"
        slides.appendChild(span);
        resolve();
      })
    })
  }
}

const button = document.querySelector('button');

button.addEventListener('click', () => {
  fetch('images/images.json', {
    method: 'GET',
    })
    .then((response) => {
      return response.json();
    })
    .then((images) => {
      addImage(images);
    })
})

const submit = document.getElementsByName('submit')[0];

submit.addEventListener('click', (e) => {
  e.preventDefault();

  const form = document.querySelector('.form');

  let formData = new FormData(form);

  console.log(formData);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .catch(() => {
    console.log('error');
  })
  .then(function (response) {
    return response.json()
  })
  .then(function (data) {
    console.log('data', data)
  })
})
