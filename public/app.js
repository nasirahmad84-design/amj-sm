const slider = document.querySelector('[data-slider]');
const slides = slider ? Array.from(slider.querySelectorAll('.slide')) : [];
const dotsContainer = document.querySelector('[data-slider-dots]');
let activeIndex = 0;
let sliderTimer;

const createDots = () => {
  if (!dotsContainer || slides.length === 0) return;
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
};

const goToSlide = (index) => {
  slides[activeIndex]?.classList.remove('active');
  dotsContainer?.children[activeIndex]?.classList.remove('active');
  activeIndex = index;
  slides[activeIndex]?.classList.add('active');
  dotsContainer?.children[activeIndex]?.classList.add('active');
  resetTimer();
};

const resetTimer = () => {
  if (sliderTimer) clearInterval(sliderTimer);
  sliderTimer = setInterval(() => {
    const next = (activeIndex + 1) % slides.length;
    goToSlide(next);
  }, 6000);
};

createDots();
if (slides.length > 0) {
  resetTimer();
}

const scrollButtons = document.querySelectorAll('[data-scroll-target]');
scrollButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.scrollTarget);
    target?.scrollIntoView({ behavior: 'smooth' });
  });
});

const form = document.getElementById('registration-form');
const select = document.getElementById('workshop-select');
const dynamicFields = document.getElementById('dynamic-fields');
const feedback = document.querySelector('.form-feedback');

const workshopQuestions = {
  'Videoproduktion': [
    {
      name: 'videoExperience',
      label: 'Welche Erfahrung habt ihr mit Videodreh und -schnitt?',
      type: 'select',
      options: ['Keine', 'Grundlagen vorhanden', 'Regelmäßige Produktionen'],
      required: true
    },
    {
      name: 'equipment',
      label: 'Welches Equipment nutzt ihr aktuell (Kameras, Mikrofone)?',
      type: 'textarea',
      required: true
    },
    {
      name: 'publishingGoal',
      label: 'Welche Formate möchtet ihr veröffentlichen (Reels, Live, Langform)?',
      type: 'text'
    }
  ],
  'Islam & Social Media': [
    {
      name: 'teamSize',
      label: 'Wie groß ist euer Social-Media-Team?',
      type: 'select',
      options: ['1-2 Personen', '3-5 Personen', '6+ Personen'],
      required: true
    },
    {
      name: 'challenge',
      label: 'Welche Herausforderungen erlebt ihr aktuell im Umgang mit Kommentaren?',
      type: 'textarea',
      required: true
    },
    {
      name: 'platforms',
      label: 'Auf welchen Plattformen seid ihr aktiv?',
      type: 'text'
    }
  ],
  'Storytelling & Narrativaufbau': [
    {
      name: 'targetAudience',
      label: 'Wer ist eure wichtigste Zielgruppe?',
      type: 'text',
      required: true
    },
    {
      name: 'coreMessage',
      label: 'Welche Botschaft möchtet ihr verstärken?',
      type: 'textarea',
      required: true
    },
    {
      name: 'formats',
      label: 'Welche Content-Formate nutzt ihr bereits?',
      type: 'text'
    }
  ]
};

const renderFields = (workshop) => {
  dynamicFields.innerHTML = '';
  if (!workshop || !workshopQuestions[workshop]) return;

  workshopQuestions[workshop].forEach((question) => {
    const label = document.createElement('label');
    label.textContent = question.label + (question.required ? '*' : '');

    let input;
    if (question.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else if (question.type === 'select') {
      input = document.createElement('select');
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Bitte wählen';
      input.appendChild(placeholder);
      question.options.forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        input.appendChild(opt);
      });
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }

    input.name = question.name;
    if (question.required) input.required = true;
    label.appendChild(input);
    dynamicFields.appendChild(label);
  });
};

select?.addEventListener('change', (event) => {
  renderFields(event.target.value);
});

const prefillButtons = document.querySelectorAll('[data-prefill]');
prefillButtons.forEach((button) => {
  button.addEventListener('click', () => {
    select.value = button.dataset.prefill;
    select.dispatchEvent(new Event('change'));
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!select.value) {
    select.focus();
    return;
  }

  const formData = new FormData(form);
  const answers = {};
  const questionSet = workshopQuestions[select.value] || [];
  questionSet.forEach((question) => {
    answers[question.label] = formData.get(question.name) || '';
  });

  const payload = {
    workshop: formData.get('workshop'),
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    organization: formData.get('organization'),
    answers
  };

  feedback.textContent = 'Wir senden Ihre Anfrage ...';

  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Es ist ein Fehler aufgetreten.');
    }

    feedback.textContent = data.message;
    form.reset();
    dynamicFields.innerHTML = '';
  } catch (error) {
    feedback.textContent = error.message;
    feedback.style.color = 'crimson';
  }
});

const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}
