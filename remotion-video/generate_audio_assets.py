import asyncio
import os
import json
import re
import numpy as np
import lameenc
import mutagen.mp3
import edge_tts

OUTPUT_DIR = r"E:\Aman\Fee reminder\remotion-video\public\audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TRACKS_CONFIG = [
    {
        "id": "english_overview",
        "title": "EduManage Launch Walkthrough",
        "voice": "en-IN-NeerjaNeural",
        "rate": "+12%",
        "scene_mappings": [
            ("hook", "paper registers"),
            ("intro", "modern operations platform"),
            ("upi_fees", "zero-commission UPI"),
            ("whatsapp_reminders", "WhatsApp payment reminders"),
            ("attendance_offline", "Mark batch attendance"),
            ("cta", "Transform your coaching")
        ],
        "script": (
            "Still tracking student fees on paper registers and messy spreadsheets? "
            "Meet EduManage — the modern operations platform built specifically for Indian coaching centers and institutes. "
            "Collect fees directly into your bank account with zero-commission UPI QR codes. "
            "Send automated WhatsApp payment reminders to parents with just a single tap. "
            "Mark batch attendance in three seconds, even offline, and monitor cash flow in real time. "
            "EduManage. Simple, fast, and reliable. Transform your coaching institute today!"
        )
    },
    {
        "id": "english_promo",
        "title": "EduManage 20s Fast-Paced Promo",
        "voice": "en-IN-PrabhatNeural",
        "rate": "+26%",
        "scene_mappings": [
            ("hook", "chasing coaching fees"),
            ("intro", "entire coaching institute"),
            ("features_rapid", "Zero commission UPI"),
            ("attendance", "lightning-fast attendance"),
            ("cta", "Switch to EduManage")
        ],
        "script": (
            "Still chasing coaching fees manually? It is time to upgrade! "
            "EduManage puts your entire coaching institute right in your pocket. "
            "Zero commission UPI payments, one-tap WhatsApp reminders, and lightning-fast attendance. "
            "Simple, powerful, and mobile-first. "
            "Switch to EduManage today and supercharge your institute!"
        )
    },
    {
        "id": "hinglish_launch",
        "title": "EduManage Hinglish Coaching Launch",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+15%",
        "scene_mappings": [
            ("hook", "Coaching chalana ab asaan"),
            ("intro", "Pesh hai EduManage"),
            ("upi_fees", "Zero commission direct UPI"),
            ("whatsapp_reminders", "WhatsApp reminder bhejo"),
            ("attendance_offline", "offline attendance mark karo"),
            ("cta", "EduManage apnao")
        ],
        "script": (
            "Coaching chalana ab asaan! Register aur Excel sheet ki jhanjhat ko bolo bye-bye. "
            "Pesh hai EduManage — India ke smart coaching centers ke liye complete all-in-one platform. "
            "Zero commission direct UPI payment, fees seedhe aapke apne bank account mein. "
            "Ek tap mein parents ko WhatsApp reminder bhejo, dynamic payment link ke saath. "
            "Sirf teen second mein offline attendance mark karo, aur instant digital fee receipts pao. "
            "EduManage apnao, aur coaching ko smart banao. Aaj hi shuru karein!"
        )
    }
]

def interpolate_words(sentence_text, start_time, end_time, fps=30):
    words = re.findall(r"\S+", sentence_text)
    if not words:
        return []
    total_chars = sum(len(w) for w in words)
    duration = max(0.05, end_time - start_time)
    
    current_time = start_time
    word_objects = []
    for i, w in enumerate(words):
        fraction = len(w) / total_chars
        w_dur = fraction * duration
        w_start = current_time
        w_end = current_time + w_dur if i < len(words) - 1 else end_time
        current_time = w_end
        
        clean_word = re.sub(r"[^\w\u0900-\u097F]", "", w)
        word_objects.append({
            "word": clean_word if clean_word else w,
            "raw": w,
            "start": round(w_start, 3),
            "end": round(w_end, 3),
            "startFrame": int(round(w_start * fps)),
            "endFrame": int(round(w_end * fps))
        })
    return word_objects

def detect_scene_tag(text, scene_mappings, default_idx):
    for tag, keyword in scene_mappings:
        if keyword.lower() in text.lower():
            return tag
    return f"scene_{default_idx + 1}"

async def generate_voiceover_track(track_cfg):
    track_id = track_cfg["id"]
    voice = track_cfg["voice"]
    rate = track_cfg["rate"]
    script = track_cfg["script"]
    scene_mappings = track_cfg["scene_mappings"]
    
    mp3_path = os.path.join(OUTPUT_DIR, f"{track_id}.mp3")
    json_path = os.path.join(OUTPUT_DIR, f"{track_id}.json")
    
    communicate = edge_tts.Communicate(script, voice, rate=rate)
    
    audio_chunks = bytearray()
    raw_boundaries = []
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.extend(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            raw_boundaries.append(chunk)
            
    with open(mp3_path, "wb") as f:
        f.write(audio_chunks)
        
    audio_meta = mutagen.mp3.MP3(mp3_path)
    exact_duration = audio_meta.info.length
    fps = 30
    total_frames = int(round(exact_duration * fps))
    
    # Process each sentence boundary as an exact sync segment
    processed_segments = []
    for idx, b in enumerate(raw_boundaries):
        s_text = b["text"].strip()
        s_start = b["offset"] / 10_000_000.0
        s_dur = b["duration"] / 10_000_000.0
        s_end = min(exact_duration, s_start + s_dur)
        
        scene_tag = detect_scene_tag(s_text, scene_mappings, idx)
        words_list = interpolate_words(s_text, s_start, s_end, fps=fps)
        
        processed_segments.append({
            "id": f"segment_{idx + 1}_{scene_tag}",
            "scene": scene_tag,
            "index": idx,
            "text": s_text,
            "start": round(s_start, 3),
            "end": round(s_end, 3),
            "startFrame": int(round(s_start * fps)),
            "endFrame": int(round(s_end * fps)),
            "durationFrames": int(round((s_end - s_start) * fps)),
            "words": words_list
        })
        
    timing_data = {
        "id": track_id,
        "title": track_cfg["title"],
        "voice": voice,
        "rate": rate,
        "audioFile": f"audio/{track_id}.mp3",
        "durationSeconds": round(exact_duration, 3),
        "durationFrames": total_frames,
        "fps": fps,
        "fullScript": script,
        "segmentCount": len(processed_segments),
        "segments": processed_segments
    }
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(timing_data, f, indent=2, ensure_ascii=False)
        
    print(f"Generated {track_id}.mp3: {exact_duration:.2f}s ({total_frames} frames @ {fps}fps, {len(processed_segments)} segments)")
    return timing_data

def synthesize_bgm():
    """
    Synthesizes an upbeat modern SaaS tech background track:
    - 124 BPM, C Major / A Minor uplift progression
    - 24 bars (~46.45 seconds) to cover full launch video duration
    - Crisp kick, snappy clap/snare, 16th hats
    - Melodic marimba/kalimba arpeggio & warm synth chords
    - Stereo field, 192 kbps MP3
    """
    sample_rate = 44100
    bpm = 124.0
    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0
    num_bars = 24 # 24 bars = 96 beats = ~46.45 seconds
    total_seconds = num_bars * bar_sec
    total_samples = int(total_seconds * sample_rate)
    
    left = np.zeros(total_samples, dtype=np.float32)
    right = np.zeros(total_samples, dtype=np.float32)
    
    # 1. Kick Drum (Sine sweep from 140Hz to 48Hz + click)
    kick_len = int(0.28 * sample_rate)
    t_k = np.linspace(0, 0.28, kick_len, endpoint=False)
    freq_sweep = 48.0 + 92.0 * np.exp(-t_k * 26.0)
    phase = 2.0 * np.pi * np.cumsum(freq_sweep) / sample_rate
    kick_body = np.sin(phase) * np.exp(-t_k * 10.0)
    kick_click = np.random.uniform(-0.15, 0.15, kick_len) * np.exp(-t_k * 80.0)
    kick_sample = (kick_body * 0.85 + kick_click * 0.15).astype(np.float32)
    
    # 2. Clap / Snare (Noise burst + body transient)
    snare_len = int(0.22 * sample_rate)
    t_s = np.linspace(0, 0.22, snare_len, endpoint=False)
    snare_noise = np.random.uniform(-0.5, 0.5, snare_len) * np.exp(-t_s * 18.0)
    snare_tone = np.sin(2.0 * np.pi * 195.0 * t_s) * np.exp(-t_s * 25.0) * 0.35
    snare_sample = (snare_noise + snare_tone).astype(np.float32)
    
    # 3. Hi-Hat (Filtered high noise)
    hat_len = int(0.06 * sample_rate)
    t_h = np.linspace(0, 0.06, hat_len, endpoint=False)
    hat_noise = np.random.uniform(-0.4, 0.4, hat_len) * np.exp(-t_h * 55.0)
    hat_sample = hat_noise.astype(np.float32)
    
    # Chord frequencies (C -> G -> Am -> F)
    chords = [
        [130.81, 164.81, 196.00, 261.63], # C
        [98.00,  123.47, 146.83, 196.00], # G
        [110.00, 130.81, 164.81, 220.00], # Am
        [87.31,  110.00, 130.81, 174.61], # F
    ]
    
    # Add chords and bass
    for bar in range(num_bars):
        chord_idx = bar % 4
        bar_start_sample = int(bar * bar_sec * sample_rate)
        chord_freqs = chords[chord_idx]
        bass_root = chord_freqs[0]
        
        # Chord pad
        bar_len = int(bar_sec * sample_rate)
        t_bar = np.linspace(0, bar_sec, bar_len, endpoint=False)
        chord_env = np.sin(np.pi * t_bar / bar_sec) ** 0.5
        
        chord_wave_l = np.zeros(bar_len, dtype=np.float32)
        chord_wave_r = np.zeros(bar_len, dtype=np.float32)
        for f in chord_freqs:
            chord_wave_l += np.sin(2 * np.pi * f * t_bar) * 0.08
            chord_wave_r += np.sin(2 * np.pi * (f * 1.004) * t_bar) * 0.08
            chord_wave_l += np.sin(2 * np.pi * (f * 2) * t_bar) * 0.03
            chord_wave_r += np.sin(2 * np.pi * (f * 2 * 0.996) * t_bar) * 0.03
            
        chord_wave_l *= chord_env
        chord_wave_r *= chord_env
        
        end_idx = min(total_samples, bar_start_sample + bar_len)
        chunk_len = end_idx - bar_start_sample
        left[bar_start_sample:end_idx] += chord_wave_l[:chunk_len]
        right[bar_start_sample:end_idx] += chord_wave_r[:chunk_len]
        
        # Bassline on 8th notes (driving pulse)
        for b in range(8):
            bass_time = (bar * 4.0) + (b * 0.5) * beat_sec
            b_sample = int(bass_time * sample_rate)
            b_len = int(0.35 * sample_rate)
            t_b = np.linspace(0, 0.35, b_len, endpoint=False)
            b_env = np.exp(-t_b * 7.0)
            b_wave = (np.sin(2 * np.pi * bass_root * t_b) + 0.3 * np.sin(2 * np.pi * (bass_root * 2) * t_b)) * b_env * 0.22
            
            e_idx = min(total_samples, b_sample + b_len)
            c_len = e_idx - b_sample
            if c_len > 0:
                left[b_sample:e_idx] += b_wave[:c_len]
                right[b_sample:e_idx] += b_wave[:c_len]
                
    # 4. Arpeggiator / Pluck Melody
    arp_scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]
    total_16ths = int(total_seconds / (beat_sec / 4.0))
    for step in range(total_16ths):
        t_step = step * (beat_sec / 4.0)
        s_idx = int(t_step * sample_rate)
        pattern = [0, 2, 4, 7, 5, 4, 2, 4, 3, 5, 7, 6, 4, 2, 1, 3]
        note_freq = arp_scale[pattern[step % len(pattern)] % len(arp_scale)]
        
        p_len = int(0.18 * sample_rate)
        t_p = np.linspace(0, 0.18, p_len, endpoint=False)
        p_env = np.exp(-t_p * 22.0)
        p_wave_l = np.sin(2 * np.pi * note_freq * t_p) * p_env * 0.12
        p_wave_r = np.sin(2 * np.pi * (note_freq * 1.002) * t_p) * p_env * 0.12
        
        e_idx = min(total_samples, s_idx + p_len)
        c_len = e_idx - s_idx
        if c_len > 0:
            left[s_idx:e_idx] += p_wave_l[:c_len]
            right[s_idx:e_idx] += p_wave_r[:c_len]
            
    # 5. Drum Beats (Kick, Snare, Hi-hats)
    total_beats = int(total_seconds / beat_sec)
    for b in range(total_beats):
        b_time = b * beat_sec
        b_sample = int(b_time * sample_rate)
        
        # Kick on 1 and 3 (and 4-on-floor during energetic parts)
        is_kick = (b % 4 == 0) or (b % 4 == 2) or (b >= 8 and b < 88)
        if is_kick:
            e_idx = min(total_samples, b_sample + kick_len)
            c_len = e_idx - b_sample
            if c_len > 0:
                left[b_sample:e_idx] += kick_sample[:c_len] * 0.55
                right[b_sample:e_idx] += kick_sample[:c_len] * 0.55
                
        # Snare/Clap on 2 and 4
        if (b % 4 == 1) or (b % 4 == 3):
            e_idx = min(total_samples, b_sample + snare_len)
            c_len = e_idx - b_sample
            if c_len > 0:
                left[b_sample:e_idx] += snare_sample[:c_len] * 0.45
                right[b_sample:e_idx] += snare_sample[:c_len] * 0.45
                
    # Hi-Hats on 16ths
    for s in range(total_16ths):
        s_time = s * (beat_sec / 4.0)
        s_sample = int(s_time * sample_rate)
        accent = 0.28 if (s % 2 == 1) else 0.16
        e_idx = min(total_samples, s_sample + hat_len)
        c_len = e_idx - s_sample
        if c_len > 0:
            left[s_sample:e_idx] += hat_sample[:c_len] * accent
            right[s_sample:e_idx] += hat_sample[:c_len] * accent
            
    # Fade in (1.0s) and Fade out (2.5s)
    fade_in_len = int(1.0 * sample_rate)
    left[:fade_in_len] *= np.linspace(0.0, 1.0, fade_in_len)
    right[:fade_in_len] *= np.linspace(0.0, 1.0, fade_in_len)
    
    fade_out_len = int(2.5 * sample_rate)
    left[-fade_out_len:] *= np.linspace(1.0, 0.0, fade_out_len)
    right[-fade_out_len:] *= np.linspace(1.0, 0.0, fade_out_len)
    
    # Limiter
    max_peak = max(np.max(np.abs(left)), np.max(np.abs(right)))
    if max_peak > 0.95:
        left = left / max_peak * 0.92
        right = right / max_peak * 0.92
    else:
        left *= 0.9
        right *= 0.9
        
    stereo_interleaved = np.empty((total_samples * 2,), dtype=np.int16)
    stereo_interleaved[0::2] = (np.clip(left, -1.0, 1.0) * 32767).astype(np.int16)
    stereo_interleaved[1::2] = (np.clip(right, -1.0, 1.0) * 32767).astype(np.int16)
    pcm_bytes = stereo_interleaved.tobytes()
    
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(192)
    encoder.set_in_sample_rate(sample_rate)
    encoder.set_channels(2)
    encoder.set_quality(2)
    mp3_data = encoder.encode(pcm_bytes)
    mp3_data += encoder.flush()
    
    bgm_path = os.path.join(OUTPUT_DIR, "bg_music_tech.mp3")
    with open(bgm_path, "wb") as f:
        f.write(mp3_data)
        
    audio_meta = mutagen.mp3.MP3(bgm_path)
    print(f"Generated bg_music_tech.mp3: {audio_meta.info.length:.2f}s, 192kbps stereo @ {sample_rate}Hz")
    return bgm_path

async def main():
    print("Generating voiceover tracks and timing metadata...")
    for cfg in TRACKS_CONFIG:
        await generate_voiceover_track(cfg)
        
    print("\nSynthesizing background tech music track...")
    synthesize_bgm()
    print("\nAll audio production assets ready in public/audio!")

if __name__ == "__main__":
    asyncio.run(main())
