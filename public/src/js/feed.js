var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// currently not in use
const saveForOffline = (e) => {
  console.log('clicked');
  if('caches' in window){
    caches.open('user-v1').then(cache => {
      cache.add('/src/images/sf-boat.jpg');
      cache.add('https://httpbin.org/get');
    })
  }
}

//clearing of duplicate createCard
const removeCard = (msg) => {
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    console.log(msg)
  }
}

function createCard(msg) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitleTextElement.style.color = 'white';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  // const saveButton = document.createElement('button');
  // saveButton.textContent = 'save';
  // saveButton.addEventListener('click', saveForOffline);
  // cardSupportingText.appendChild(saveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
  console.log(msg)
}

const url = 'https://httpbin.org/get';
let networkDataReceived = false;

fetch('https://httpbin.org/get')
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log('the networks have it: ', data)
    networkDataReceived = true;
    console.log('from the network, networkdatareceived: ', networkDataReceived);
    removeCard('the network is doing the replacing')
    createCard('this is the network');
  });

if('caches' in window){
  caches.match(url).then(response => {
    if(response){ 
      return response.json();
    }
  }).then(data => {
    if(!networkDataReceived){
      console.log('from the cache, networkdatareceived: ', networkDataReceived);
      console.log('coming from the caches now we here: ', data);
      removeCard('the cache is doing the replacing');
      createCard('this is the cache');
    }
    
  })
}
