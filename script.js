
const calculator = document.getElementById('calculator');
const logoutButton = document.getElementById('logoutButton');
const tryAgain = document.getElementById('tryAgain');
const login = document.getElementById('login');
const selectClass = document.getElementById('selectClass');
const calculate = document.getElementById('calculate');
const signIn = document.getElementById('signIn');

let names = [];
let grades = new Map();

function createElements() {
  for (let i = 0; i < names.length; i++) {
    let opt = document.createElement('option');
    opt.value = names[i];
    let avg = '--';
    let classGrades = grades.get(names[i]);
    if (classGrades.length === 3) {
      avg = (parseFloat(classGrades[0][4]) + parseFloat(classGrades[1][4]) + parseFloat(classGrades[2][4])).toFixed(3);
    }
    opt.textContent = `${names[i]} | Average: ${avg}`;
    selectClass.appendChild(opt);
  }
}

signIn.addEventListener('click', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    loadingSpinner.classList.remove('hidden');
    tryAgain.classList.add('hidden');
    if (username === '' || password === '') {
      tryAgain.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
      return;
    }
    signIn.disabled = true;
    const response = await fetch(`https://home-access-api-python.vercel.app/api/getGrades?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    signIn.disabled = false;
    if (response.ok) {
      const data = await response.json();
      login.classList.add('hidden');
      logoutButton.classList.remove('hidden');
      calculator.classList.remove('hidden');
      names = data['names'];
      // console.log(data['names']);
      // console.log(data['grades']);
      for (let i = 0; i < names.length; i++) {
        grades.set(names[i], data['grades'][i]);
      }
      createElements();
    } else {
      console.error('Error fetching data:', response.statusText);
      tryAgain.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loadingSpinner.classList.add('hidden');
  }
});

logoutButton.addEventListener('click', () => {
  window.location.reload();
});

calculate.addEventListener('click', (e) => {
  e.preventDefault();
  let classGrades = grades.get(selectClass.value);
  let category = parseInt(document.getElementById('selectCategory').value);
  let desiredGrade = parseFloat(document.getElementById('inputGrade').value);
  let noGrades = document.getElementById('noGrades');
  let neededGrade = document.getElementById('neededGrade');

  neededGrade.classList.add('hidden');
  noGrades.classList.add('hidden');

  if (classGrades.length !== 3 || isNaN(desiredGrade)) {
    noGrades.classList.remove('hidden');
    return;
  }

  while (neededGrade.firstChild) {
    neededGrade.removeChild(neededGrade.firstChild);
  }

  let numMajors = classGrades[0][1] / 100;
  let numMinors = classGrades[1][1] / 100;
  let numOthers = classGrades[2][1] / 100;

  let majorWeight = classGrades[0][3] / 100;
  let minorWeight = classGrades[1][3] / 100;
  let otherWeight = classGrades[2][3] / 100;

  let totalMajor = classGrades[0][0];
  let totalMinor = classGrades[1][0];
  let totalOther = classGrades[2][0];

  let ans = 0.0;
  // MAJOR
  if (category === 0) ans = (((desiredGrade - ((totalMinor / Math.max(1, numMinors)) * minorWeight + (totalOther / Math.max(1, numOthers)) * otherWeight)) / majorWeight) * (numMajors + 1)) - totalMajor;
  // MINOR
  else if (category === 1) ans = (((desiredGrade - ((totalMajor / Math.max(1, numMajors)) * majorWeight + (totalOther / Math.max(1, numOthers)) * otherWeight)) / minorWeight) * (numMinors + 1)) - totalMinor;
  // OTHER
  else if (category === 2) ans = (((desiredGrade - ((totalMinor / Math.max(1, numMinors)) * minorWeight + (totalMajor / Math.max(1, numMajors)) * majorWeight)) / otherWeight) * (numOthers + 1)) - totalOther;
  
  let avg = (parseFloat(classGrades[0][4]) + parseFloat(classGrades[1][4]) + parseFloat(classGrades[2][4]));
  neededGrade.classList.remove('hidden');
  let wordsArray = `You need a ${ans.toFixed(4)} on your next ${(category === 0 ? "test" : category === 1 ? "quiz" : "other")} to ${(desiredGrade <= avg ? 'keep' : 'get up to')} a ${desiredGrade}, given that you have a ${avg.toFixed(4)}`.split(" ");
  wordsArray.forEach((word, index) => {
    const wordElement = document.createElement("span");
    wordElement.classList.add("word");
    wordElement.textContent = word + " ";
    neededGrade.appendChild(wordElement);

    setTimeout(() => {
      wordElement.classList.add("fade-in");
    }, index * 100);
  });
});
