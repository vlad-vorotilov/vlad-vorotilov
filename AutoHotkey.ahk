#Requires AutoHotkey v2.0
#Warn

SetCapsLockState "AlwaysOff"
 
CapsLock & j::Send "{Left}"
CapsLock & h::Send "^{Left}"
CapsLock & i::Send "{Up}"
CapsLock & k::Send "{Down}"
CapsLock & l::Send "{Right}"
CapsLock & `;::Send "^{Right}"
CapsLock & m::Send "{Backspace}"
CapsLock & n::Send "^{Backspace}"
CapsLock & ,::Send "{Delete}"
CapsLock & .::Send "^{Delete}"
CapsLock & u::Send "{Home}"
CapsLock & o::Send "{End}"

LShift & RShift::TriggerCaps()
RShift & LShift::TriggerCaps()

TriggerCaps()
{
  if GetKeyState("CapsLock", "T")
    SetCapsLockState "AlwaysOff"
  else
    SetCapsLockState "AlwaysOn"
  return
}
