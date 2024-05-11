import path from 'path';
import crypto from 'crypto'
import * as fs from 'node:fs/promises';
import express from 'express';
import cors from 'cors';
import { TTS } from './tts.mjs';
import { error } from 'console';

// These aren't defined in the ES module scope
const _rootDir = process.cwd();
const __dirname = import.meta.dirname;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());

const SOUND_META_FILE = `${_rootDir}/db/soundMeta.json`;

// API Routes
// Generate sound file based on prompt.
app.post('/audio', async (req, res) => {
	const id = crypto.randomUUID();
	const prompt = req.body.prompt;
	const name = req.body.name || null;
	const options = { ...req.body.options };

	const meta = {
		id,
		name,
		time: Date.now(),
		prompt,
		options,
		files:{}
	};

	try {
		const newSoundFileName = await TTS.generateSpeech(meta.id, meta.prompt, meta.options);
		if (!newSoundFileName.success) {
			res.status(400);
			return res.send({error: newSoundFileName.errorMessage});
		}
		meta.files.soundFile = newSoundFileName;
	} catch (err) {
		console.error(err);
	}

	if (options.lipsync) {
		try {
			const dialogFile = `${_rootDir}/public/dialog/${id}.txt`;
			await fs.writeFile(dialogFile, JSON.stringify(prompt, null, '	'), 'utf8');
			meta.files.dialogFile = dialogFile;
			meta.lipsyncData = await TTS.generateLipsync(meta.files.soundFile, meta.files.dialogFile);
		} catch (err) {
			console.error(err);
		}
	}

	try {
		const soundMeta = JSON.parse(await fs.readFile(SOUND_META_FILE));
		soundMeta.push(meta);
		fs.writeFile(SOUND_META_FILE, JSON.stringify(soundMeta, null, '	'), 'utf8');
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.info('No soundMeta file detected, generating file.');
			await fs.writeFile(SOUND_META_FILE, JSON.stringify([meta], null, '	'), 'utf8');
		}
	}

	console.info(`Sound generated for prompt: ${prompt}, with id: ${id}`);
	res.send(meta);
});

// Static content
app.use(express.static(path.join(__dirname, 'public')));

app.listen(9600, function () {
	console.log('TTS server listening on port 9600');
});

