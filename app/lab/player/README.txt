Abstract
========
You need to build a “melody player”. 
The melody player parses melody files in a unique format and plays them using the attached “sound bank”.
You can write it in any technology and/or language. 
It needs to have a way to play WAVE sound files (either with built-in SDK or 3rd party libraries).

The result should be a command line tool or an app with UI (mobile/desktop/web).
It should play any of the attached melody files by using the attached sound bank in the manner described below.

YOU HAVE 60 MINUTES to have a working solution from the moment you finished reading this document.
At this phase, it's OK to completely disregard code quality and best practices in order to reach the goal:
A working solution in 60 minutes.

Make sure you read the rest of this README carefully, and inspect the attached files.
Once you feel you are ready to start coding, call your interviewer to start the clock.

Attached Files
==============
- melodies directory: A set of example melodies for you to try. 
                      You should start with MelodyHappyBirthday.txt for simplicity
                      How many of the other melodies do you recognize? :)
- sound_bank directory: A set of .wav files that match any possible note from the melodies. 
                        The files are named in the format of <NOTE_NAME>.wav (e.g. 'C4.wav')
- ExampleGOT.m4a: An example recording of a played melody, to demonstrate how result should sound like.

Melody File Format
==================
A text file that consists of “melody chunks” separated by any whitespace character.

Each chunk is in the format of <NOTE_NAME>:<TIME_UNTIL_NEXT_NOTE>

  <NOTE_NAME> can be something in the form like 'A4' (a note and an octave). 
              You shouldn't really care what it means musically, 
              as you’ll just need to match it to the correct sound file from the sound bank.

  <TIME_UNTIL_NEXT_NOTE> is a float that indicates how long the app waits between STARTING to play this 
                         note and starting to play the next one IN SECONDS.
                         (can be a floating point number).
                         You can assume this time will always be longer than the length of wave 
                         files in the sound bank.
                         NOTE: You are NOT expected to stretch or loop the wave files to achieve this delay. 
                               Instead, you should BE IDLE or play silence in between notes.
			 REMEMBER: This float represents the time from the START of this note to the START
			           of the next note.

An example melody, 'Yonatan Hakatan':

G4:0.5 E4:0.5 E4:1 F4:0.5 D4:0.5 D4:1
C4:0.5 D4:0.5 E4:0.5 F4:0.5 G4:0.5 G4:0.5 G4:1
G4:0.5 E4:0.5 E4:1 F4:0.5 D4:0.5 D4:1
C4:0.5 E4:0.5 G4:0.5 G4:0.5 C4:2

You can assume the melody file is well formatted and that all notes exist in the sound bank.

====

Good Luck!
Don't forget to call your interviewer before starting to code.
