import { getImagesByQuery } from './js/pixabay-api.js'; 
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', async event => {
  event.preventDefault();
  query = form.elements['search-text'].value.trim();

  if (!query) {
    iziToast.warning({ message: 'Please enter a search query!' });
    return;
  }

  clearGallery();
  hideLoadMoreButton();
  page = 1;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    createGallery(data.hits);
    if (totalHits > 15) showLoadMoreButton();
  } catch (error) {
    iziToast.error({ message: 'Something went wrong. Try again later.' });
  } finally {
    hideLoader();
    form.reset();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page++;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);
    smoothScroll();

    const loadedImages = document.querySelectorAll('.gallery-item').length;
    if (loadedImages >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({ message: "We're sorry, but you've reached the end of search results." });
    }
  } catch (error) {
    iziToast.error({ message: 'Something went wrong. Try again later.' });
  } finally {
    hideLoader();
  }
});

function smoothScroll() {
  const { height: cardHeight } = document.querySelector('.gallery-item').getBoundingClientRect();
  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}
