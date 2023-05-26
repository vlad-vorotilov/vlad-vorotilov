#Requires AutoHotkey v2.0
#Warn

SetCapsLockState "AlwaysOff"
 
CapsLock & j::Send "{Left}"
CapsLock & i::Send "{Up}"
CapsLock & k::Send "{Down}"
CapsLock & l::Send "{Right}"
CapsLock & m::Send "{Backspace}"
CapsLock & ,::Send "{Delete}"

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