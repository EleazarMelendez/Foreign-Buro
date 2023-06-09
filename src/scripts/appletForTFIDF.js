// Instructs configuration on how to access the .env file

require('dotenv').config()

// Imports Supabase hook >>

const { createClient } = require("@supabase/supabase-js");

// Defines values used in Supabase hook >>

const supabaseUrl = 'https://bhzxwvltfuqsmnhgqjrf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

//  Create a constant that represents the time exactly 24 hours ago >>

const currentTimestamp = new Date();
const timestampMinus24 = new Date(currentTimestamp.getTime() - (24 * 60 * 60 * 1000)).toISOString()

// Creates a constant that represents the country to be filtered by. (Right now, static. Later will be based on user input.)

// const country = 'Peru'

// Async function to contain all the code needed to implement NLP on desired text

async function nlpProcessing (country) {

// Imports necesary fields from Supabase database, using time- and country- based filter

let { data, error } = await supabase
  .from('ParsedArticles')
  .select('id,country,article_headline')
  .gte('article_published', timestampMinus24)
  .eq('country', country)

// Maps the imported headlines an UUID into two different arrays
  
const uniqueID = data.map(obj => obj.id);
const headlines = data.map(obj => obj.article_headline);

// Calls necessary functions (tokenizer and TF-IDF algorithm) from 'Natural' JS library >>

const natural = require('natural');
const tokenizer = new natural.AggressiveTokenizerEs();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

// tokenizes each headline and adds it to the list of strings to be analized using TF-IDF algotiyhm >>

  headlines.forEach(headline => {
    tfidf.addDocument(tokenizer.tokenize(headline));
  });

// Runs a nested loop that compares each tokenized headline against each other tokenized headlinem then creates a long array for each headline, that determines how alike headlines are to each other based on the TF-IDF algorithm >>

  const similarities = [];

headlines.forEach((headline, i) => {
  const scores = [];

  headlines.forEach((headline2, j) => {
    if (i === j) {
      scores.push(0);
    } else {
      const score = tfidf.tfidf(tokenizer.tokenize(headline), j);
      scores.push(score/headline.length);
    }
  });

// Adds the TF-IDF "score" given to each headline. By default this will mean news articles with repeating, yet distinctive language will obtain a higher value >>

  similarities.push(scores.reduce((accumulator, currentValue) => accumulator + currentValue)*100/scores.length);
});

// Creates a "result" object, where each headline's uuid is mapped as key, and the corresponding TF-IDF score is the value >>

const result = {};

for (let i = 0; i < uniqueID.length; i++) {
  result[uniqueID[i]] = similarities[i];
}
console.log(result);

return result;
} 


module.exports = { nlpProcessing };