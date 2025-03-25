import { Howl } from "howler";

//SoundPlayer
export const beat = new Howl({
    src: ["/beats/floater.mp3"],
    loop: true,
    volume: 0.5,
});

export function playBeat(){
    beat.playing() ? beat.pause() : beat.play();
}