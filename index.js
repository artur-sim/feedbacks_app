const express = require('express');
const app = express();
const exhbs = require('express-handlebars')
const fs = require('fs');
const PORT = 3212;
const FILE = './feedbacks.json';

app.engine('handlebars', exhbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'))

async function writeToFile(body) {
    const comments = await readFromFile();
    comments.push(body);
    const error = fs.writeFileSync(FILE, JSON.stringify(comments));
    return error;
}

async function readFromFile() {
    const rawdata = await fs.readFileSync(FILE);
    const comments = JSON.parse(rawdata);

    return comments;
}

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.post('/feedbacks', async function (req, res) {
    await writeToFile(req.body);
    res.json({
        success: true,
        body: req.body
    });
});

app.get('/feedbacks', async function (req, res) {
    res.json({
        success: true,
        body: await readFromFile()
    });
});

app.get('/', async (req, res) => {
    let date = new Date();
    let parsedComments = await readFromFile();

    date.setHours(date.getHours() + 2)
    res.render('form/index', {
        date: date.toISOString(),
        comments: parsedComments
    })
})

app.get('/download/:feedback', async (req, res) => {
    let data = req.query;
    // console.log(data)
    let file = await readFromFile();
    // console.log(file)
    let download = './comment.txt';
    let commentFound = false;
    file.forEach(f => {
        if ((f.first_name === data.name) && (f.date === data.date)) {
            fs.writeFileSync(download, JSON.stringify(f));
            commentFound = true;
        }
    });


    if (commentFound) {
        res.download(download)
    } else {
        res.json({
            status: "Error",
            message: "Comment was not found"
        })
    }


})

app.listen(PORT, () => console.log(`Server app listening on port ${PORT}!`));