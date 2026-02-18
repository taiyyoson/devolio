# devolio

  terminal-style developer portfolio. type commands to navigate projects, experience,
  and publications like a filesystem.

  ┌──────────────────────────────────────────┐
  │ taiyo@devolio:~$ ls                      │
  │ about.txt  contact.txt  projects/        │
  │ experience/  publications/               │
  │                                          │
  │ taiyo@devolio:~$ cat about.txt           │
  │ ...                                      │
  │                                          │
  │ taiyo@devolio:~$ gui                     │
  │ → switches to traditional portfolio view │
  └──────────────────────────────────────────┘

  commands

  ┌─────────────┬──────────────────────────┐
  │   command   │       description        │
  ├─────────────┼──────────────────────────┤
  │ help        │ list all commands        │
  ├─────────────┼──────────────────────────┤
  │ ls [dir]    │ list directory contents  │
  ├─────────────┼──────────────────────────┤
  │ cd <dir>    │ change directory         │
  ├─────────────┼──────────────────────────┤
  │ cat <file>  │ display file contents    │
  ├─────────────┼──────────────────────────┤
  │ open <url>  │ open url in new tab      │
  ├─────────────┼──────────────────────────┤
  │ whoami      │ user info                │
  ├─────────────┼──────────────────────────┤
  │ pwd         │ print working directory  │
  ├─────────────┼──────────────────────────┤
  │ echo <text> │ print text               │
  ├─────────────┼──────────────────────────┤
  │ date        │ current date/time        │
  ├─────────────┼──────────────────────────┤
  │ history     │ command history          │
  ├─────────────┼──────────────────────────┤
  │ theme       │ toggle dark/light        │
  ├─────────────┼──────────────────────────┤
  │ gui         │ switch to portfolio view │
  ├─────────────┼──────────────────────────┤
  │ clear       │ clear terminal           │
  └─────────────┴──────────────────────────┘

  tab-complete and arrow-key history supported.

  stack

  next.js 16 · react 19 · tailwind v4 · jetbrains mono · supabase

  run

  npm install
  npm run dev
