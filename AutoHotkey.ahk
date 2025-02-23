#Requires AutoHotkey v2.0
#Warn

SetCapsLockState "AlwaysOff"
 
#HotIf GetKeyState("CapsLock", "P")

j::Send "{Left}"
+j::Send "+{Left}"
h::Send "^{Left}"
+h::Send "+^{Left}"
l::Send "{Right}"
+l::Send "+{Right}"
`;::Send "^{Right}"
+`;::Send "+^{Right}"
i::Send "{Up}"
+i::Send "+{Up}"
k::Send "{Down}"
+k::Send "+{Down}"
u::Send "{Home}"
+u::Send "+{Home}"
o::Send "{End}"
+o::Send "+{End}"
*m::Send "{Backspace}"
*n::Send "^{Backspace}"
*,::Send "{Delete}"
*.::Send "^{Delete}"

#HotIf

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
