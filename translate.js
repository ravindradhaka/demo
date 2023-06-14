const fs = require('fs');
const csv = require('csv-parser');

const inputFilePath = 't8.shakespeare.txt';
const findWordsFilePath = 'find_words.txt';
const dictionaryFilePath = 'french_dictionary.csv';
const startTime = performance.now();

const findWords = fs.readFileSync(findWordsFilePath, 'utf-8').split('\n').map(word => word.trim());

const dictionary = {};

const frequency = {};

fs.createReadStream(dictionaryFilePath)
  .pipe(csv())
  .on('data', (data) => {
    const [english, french] = Object.values(data);
      // console.log('english', english, french)
    dictionary[english] = french;
    frequency[english] = 0;
  })
  .on('end', () => {
    const inputText = fs.readFileSync(inputFilePath, 'utf-8');

    let translatedText = inputText;
    findWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (dictionary.hasOwnProperty(word)) {
        translatedText = translatedText.replace(regex, dictionary[word]);
        frequency[word] += inputText.match(regex).length;
      }
    });


    fs.writeFileSync('t8.shakespeare.translated.txt', translatedText, 'utf-8');

    let frequencyContent = 'English word,French word,Frequency\n';
    for (const word in frequency) {
      const frenchWord = dictionary[word];
      const wordFrequency = frequency[word];
      frequencyContent += `${word},${frenchWord || ''},${wordFrequency}\n`;
    }
    fs.writeFileSync('frequency.csv', frequencyContent, 'utf-8');

    const endTime = performance.now();
    const timeElapsed = (endTime - startTime) / 1000; // Convert to seconds
    const memoryUsage = process.memoryUsage().rss / 1024 / 1024; // Convert to MB

    // Create the content for the performance.txt file
    const performanceContent = `Time to process: ${timeElapsed.toFixed(0)} seconds\nMemory used: ${memoryUsage.toFixed(2)} MB`;

    // Write the performance content to the performance.txt file
    fs.writeFileSync('performance.txt', performanceContent, 'utf-8');
  });
