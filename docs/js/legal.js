/* Rechtsseiten: einzige Interaktion ist die Trennlinie unter der Nav. */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });
