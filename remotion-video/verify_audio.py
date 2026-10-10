import json
import mutagen.mp3

for name in ['english_overview', 'english_promo', 'hinglish_launch']:
    json_path = f'E:/Aman/Fee reminder/remotion-video/public/audio/{name}.json'
    mp3_path = f'E:/Aman/Fee reminder/remotion-video/public/audio/{name}.mp3'
    
    with open(json_path, encoding='utf-8') as f:
        d = json.load(f)
    audio = mutagen.mp3.MP3(mp3_path)
    
    print(f"=== {d['title']} ({d['voice']}) ===")
    print(f"Audio file: {d['audioFile']} | Exact MP3 length: {audio.info.length:.2f}s | Bitrate: {audio.info.bitrate//1000}kbps")
    print(f"Duration: {d['durationSeconds']}s | Frames: {d['durationFrames']} frames @ {d['fps']} fps")
    print("Cue Points / Segments:")
    for s in d['segments']:
        words_count = len(s.get('words', []))
        print(f"  [{s['start']:5.2f}s - {s['end']:5.2f}s | F {s['startFrame']:4d}-{s['endFrame']:4d}] ({s['scene']:18}) {s['text']} ({words_count} words)")
    print()

bgm_path = 'E:/Aman/Fee reminder/remotion-video/public/audio/bg_music_tech.mp3'
bgm = mutagen.mp3.MP3(bgm_path)
print(f"=== Background Music Track: bg_music_tech.mp3 ===")
print(f"Length: {bgm.info.length:.2f}s | Bitrate: {bgm.info.bitrate//1000}kbps | Sample Rate: {bgm.info.sample_rate}Hz | Channels: {bgm.info.channels}")
