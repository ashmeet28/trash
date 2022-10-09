set nocompatible

filetype on

filetype plugin on

filetype indent on

syntax on

set number

set shiftwidth=4

set tabstop=4

set expandtab

set nobackup

set scrolloff=10

set nowrap

set incsearch

set hidden

set mouse=a

if (has('termguicolors'))
  set termguicolors
endif

call plug#begin()

Plug 'morhetz/gruvbox'

call plug#end()

set background=dark

colorscheme gruvbox
