const weatherStates = {
  sun: { label: "Sol", description: "Soleado, con brisa suave." },
  rain: { label: "Lluvia", description: "Lluvia constante cae sobre el prado." },
  snow: { label: "Nieve", description: "Nieve ligera cae sobre el prado." },
  blizzard: { label: "Ventisca", description: "La nieve y el viento cubren el escenario." },
  sandstorm: { label: "Tormenta de arena", description: "Arena y polvo cruzan el prado con fuertes ráfagas." }
};

function requireElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`No se encontró el control del escenario: ${selector}`);
  }
  return element;
}

const weatherMenu = requireElement("#weather-options");
const weatherTrigger = requireElement(".weather-trigger");
const weatherDescription = requireElement("#weather-description");
const weatherButtons = [...weatherMenu.querySelectorAll("[data-weather-option]")];
const clockFace = requireElement(".clock-face");
const hourHand = requireElement('[data-clock-hand="hour"]');
const celestialBody = requireElement(".celestial-body");
const periodButtons = [...document.querySelectorAll("[data-period]")];

if (weatherButtons.length !== Object.keys(weatherStates).length) {
  throw new Error("La lista de opciones de clima no coincide con los estados definidos.");
}

if (periodButtons.length !== 2) {
  throw new Error("El reloj debe tener los controles AM y PM.");
}

function setWeather(weather) {
  const state = weatherStates[weather];
  if (!state) {
    throw new Error(`Estado de clima no reconocido: ${weather}`);
  }

  document.body.dataset.weather = weather;
  weatherDescription.textContent = state.description;

  for (const button of weatherButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.weatherOption === weather));
  }
}

weatherTrigger.setAttribute("aria-expanded", "false");
weatherMenu.addEventListener("toggle", () => {
  weatherTrigger.setAttribute(
    "aria-expanded",
    String(weatherMenu.matches(":popover-open"))
  );
});

for (const button of weatherButtons) {
  button.addEventListener("click", () => {
    setWeather(button.dataset.weatherOption);
    weatherMenu.hidePopover();
  });
}

setWeather(document.body.dataset.weather);

let hour = 12;
let period = "PM";

function updateClock() {
  const hour24 = hour % 12 + (period === "PM" ? 12 : 0);
  const isDay = hour24 >= 6 && hour24 < 18;
  const timeOfDay = isDay ? "day" : "night";
  const lightPhase = hour24 >= 5 && hour24 < 7
    ? "dawn"
    : hour24 >= 17 && hour24 < 19
      ? "dusk"
      : timeOfDay;

  hourHand.setAttribute("aria-valuenow", String(hour));
  hourHand.setAttribute("aria-valuetext", `${hour}:00 ${period}`);
  hourHand.style.setProperty("--hand-angle", `${(hour % 12) * 30}deg`);

  for (const button of periodButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.period === period));
  }

  document.body.dataset.timeOfDay = timeOfDay;
  document.body.dataset.lightPhase = lightPhase;
  celestialBody.textContent = isDay ? "☀️" : "🌙";

  const elapsed = isDay
    ? hour24 - 6
    : hour24 >= 18 ? hour24 - 18 : hour24 + 6;
  const progress = elapsed / 12;
  celestialBody.style.left = `${6 + progress * 88}%`;
  celestialBody.style.top = `${55 - Math.sin(progress * Math.PI) * 40}%`;
}

function setTime(nextHour, nextPeriod = period) {
  hour = ((nextHour - 1) % 12 + 12) % 12 + 1;
  period = nextPeriod;
  updateClock();
}

function setFromPointer(event) {
  const bounds = clockFace.getBoundingClientRect();
  const x = event.clientX - (bounds.left + bounds.width / 2);
  const y = event.clientY - (bounds.top + bounds.height / 2);
  const angle = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;

  setTime(Math.round(angle / 30) % 12 || 12);
}

hourHand.addEventListener("pointerdown", event => {
  if (event.button !== 0) return;
  event.preventDefault();
  hourHand.setPointerCapture(event.pointerId);
  setFromPointer(event);
});

hourHand.addEventListener("pointermove", event => {
  if (hourHand.hasPointerCapture(event.pointerId)) {
    setFromPointer(event);
  }
});

hourHand.addEventListener("keydown", event => {
  const direction = ["ArrowRight", "ArrowUp"].includes(event.key)
    ? 1
    : ["ArrowLeft", "ArrowDown"].includes(event.key)
      ? -1
      : 0;
  if (!direction) return;

  event.preventDefault();
  setTime(hour + direction);
});

for (const button of periodButtons) {
  button.addEventListener("click", () => {
    setTime(hour, button.dataset.period);
  });
}

updateClock();
