# Writes a synthetic "voice" for the tone-lab microphone test: 0.5 s silence, a 0.6 s falling glide
# (250 -> 140 Hz, three harmonics, like a 4th tone), 1.4 s silence. Usage: python3 mk_t4wav.py out.wav
import wave,struct,math,sys
sr=48000
def tone(f0,f1,d):
  ph=0;out=[];n=int(sr*d)
  for i in range(n):
    x=i/n;f=f0*(f1/f0)**x;ph+=2*math.pi*f/sr;env=min(1,i/(sr*.03),(n-i)/(sr*.03))
    out.append(env*(.5*math.sin(ph)+.25*math.sin(2*ph)+.12*math.sin(3*ph)))
  return out
sig=[0]*int(sr*.5)+tone(250,140,.6)+[0]*int(sr*1.4)
w=wave.open(sys.argv[1],'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr)
w.writeframes(b''.join(struct.pack('<h',int(32000*.6*s)) for s in sig));w.close()
