const flip = document.querySelector('.flip');

const signin = document.querySelector('.signin__desc');

/* форма входа */
const closeLogin = document.getElementsByName('close')[0];
const submitLogin = document.getElementsByName('submitLogin')[0];
const loginInput = document.getElementsByName('login')[0];
const passwordLogin = document.getElementsByName('password')[0];

/* форма регистрации */
const closeReg = document.getElementsByName('closeReg')[0];
const submitReg = document.getElementsByName('submitReg')[0];
const loginReg = document.getElementsByName('loginReg')[0];
const emailReg = document.getElementsByName('emailReg')[0];
const passReg = document.getElementsByName('passReg')[0];
const passConfirmReg = document.getElementsByName('passConfirmReg')[0];

const showForm = (show) => {
  if (show) {
    flip.classList.add('flip_show');
    setTimeout(() => {
      flip.style="opacity: 1;";
      signin.classList.add('signin__desc_open');
    },0);
  } else {
    flip.style="opacity: ;";
    signin.classList.remove('signin__desc_open');
    setTimeout(() => {
      flip.classList.remove('flip_show');
      flip.classList.remove('flip_backside');
    }, 300);
  }
};

const buttonActive = (element, active) => {
  if (active) {
    element.disabled = false;
  } else {
    element.disabled = true;
  }
}

const badLoginOrPass = (red) => {
  if (red) {
    loginInput.classList.add('form__input_error');
    passwordLogin.classList.add('form__input_error');
  } else {
    loginInput.classList.remove('form__input_error');
    passwordLogin.classList.remove('form__input_error');
  }
}

const flippingCard = (side) => {
  const flip = document.querySelector('.flip');
  if (side === 'back') {
    flip.classList.add('flip_backside');
  } else if (side === 'front') {
    flip.classList.remove('flip_backside');
  }
}

signin.addEventListener('click', () => {
  if (!flip.classList.contains('flip_show')) {
    showForm(true);
  } else {
    showForm(false);
  }
});

document.querySelector('.signin__reg')
  .addEventListener('click', () => {
    flippingCard('back');
  });

closeLogin.addEventListener('click', () => {showForm(false)});
closeReg.addEventListener('click', () => {showForm(false)});

submitLogin.addEventListener('click', (e) => {
  e.preventDefault();

  const form = document.querySelector('.signin__form');

  let formData = new FormData(form);

  fetch('/login', {
    method: 'POST',
    body: formData
  })
    .catch((err) => {
      console.log(err);
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const { login, password } = data;
      if (login) {
        loginInput.classList.remove('form__input_error');
        loginInput.classList.add('form__input_ok');
      } else {
        loginInput.classList.remove('form__input_ok');
        loginInput.classList.add('form__input_error');
        // badLoginOrPass(true);
      }
      if (password) {
        passwordLogin.classList.add('form__input_ok');
        passwordLogin.classList.remove('form__input_error');
      } else {
        passwordLogin.classList.remove('form__input_ok');
        passwordLogin.classList.add('form__input_error');
      }

      if (login && password) {
        signin.classList.add('signin__desc_active');
        showForm(false);
      } else {
        signin.classList.remove('signin__desc_active');
      }
      console.log(data);
    })
});

loginInput.addEventListener('input', () => {
  if (loginInput.value !== '' && passwordLogin.value !== '') {
    buttonActive(submitLogin, true);
    badLoginOrPass(false);
  } else {
    buttonActive(submitLogin, false);
  }
})
passwordLogin.addEventListener('input', () => {
  if (loginInput.value !== '' && passwordLogin.value !== '') {
    buttonActive(submitLogin, true);
    badLoginOrPass(false);
  } else {
    buttonActive(submitLogin, false);
  }
})

const validReg = () => {
  buttonActive(submitReg, false);
  if (loginReg.value === '') return;
  if (emailReg.value === '') return;
  if (passReg.value === '') return;
  if (passConfirmReg.value === '') return;
  if (passReg.value !== passConfirmReg.value) {
    passConfirmReg.classList.add('form__input_error');
    return;
  };

  passConfirmReg.classList.remove('form__input_error');
  buttonActive(submitReg, true);
}

loginReg.addEventListener('input', () => {
  loginReg.classList.remove('form__input_error');
  validReg();
});
emailReg.addEventListener('input', () => {
  emailReg.classList.remove('form__input_error');
  validReg();
});
passReg.addEventListener('input', () => {
  passReg.classList.remove('form__input_error');
  validReg();
});
passConfirmReg.addEventListener('input', () => {
  validReg();
});

submitReg.addEventListener('click', (e) => {
  e.preventDefault();

  const form = document.getElementsByName('register')[0];

  const formData = new FormData(form);

  fetch('/register', {
    method: 'POST',
    body: formData
  })
    .catch((err) => {
      console.log(err);
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      if (data.login) {
        loginReg.classList.add('form__input_error');
      }
      if (data.email) {
        emailReg.classList.add('form__input_error');
      }
    })

});
