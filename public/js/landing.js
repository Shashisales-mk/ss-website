const sp1 = document.querySelector('.sp1');
const hi1 = document.querySelector('.hi1');
const sp2 = document.querySelector('.sp2');
const hi2 = document.querySelector('.hi2');

const pt = document.querySelector('.ssstrip');

function addHoverEffect(sectionClass, imageClass) {
    const section = document.querySelector(`.${sectionClass}`);
    const image = document.querySelector(`.${imageClass}`);

    section.addEventListener('mouseover', () => {
        image.classList.add('visible');
        pt.classList.add('elevated');
    });

    section.addEventListener('mouseout', () => {
        image.classList.remove('visible');
        pt.classList.remove('elevated');
    });
}

addHoverEffect('sp1', 'hi1'); 
addHoverEffect('sp2', 'hi2');