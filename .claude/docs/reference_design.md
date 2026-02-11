<!-- TasteRank Home -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TasteRank Home</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec7f13",
                        "primary-light": "#ffb063",
                        "primary-dark": "#b85e00",
                        "background-light": "#f8f7f6",
                        "background-dark": "#221910",
                        "neutral-surface": "#fff9f2",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"},
                    boxShadow: {
                        'glow': '0 4px 20px -2px rgba(236, 127, 19, 0.3)',
                    }
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        /* Hide scrollbar for clean mobile look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen flex justify-center overflow-x-hidden">
<!-- Mobile Container -->
<div class="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen relative flex flex-col pb-24 shadow-2xl">
<!-- Header -->
<header class="px-6 pt-12 pb-4 flex justify-between items-center z-10 sticky top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
<div class="flex items-center gap-2">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
<span class="material-icons text-sm">restaurant</span>
</div>
<h1 class="font-display font-bold text-xl tracking-tight text-gray-900 dark:text-white">TasteRank</h1>
</div>
<button class="relative group">
<div class="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden">
<img alt="User Profile" class="w-full h-full object-cover rounded-full" data-alt="Portrait of a smiling woman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsKLu3hL1sQA6W04uTd0rY0rRQWdK9UEhpxvW9J1bxPlthVS_HWYxDuJgQG5FyqM_mRaa-Z7HcBzSGrRN-ru2Xb8cKsZHGnkl_V5KvWvxC656mXBZ-I3ZRFMrbFJ6-x3GGetUl17ECQ3MboMZ3596nMco8KSvELx8K_mTKptXKascHyOehSA4KRrpUvyyntJtSgsFPyWcqWaWNvEbagdZQfV85B9-BXALNmoX_SLb5svvytSs7esqblyo50ufl3zbI0z2T1CyMFS8"/>
</div>
<div class="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background-light dark:border-background-dark"></div>
</button>
</header>
<!-- Main Content -->
<main class="flex-1 px-6 flex flex-col gap-8">
<!-- Hero Section -->
<section class="mt-4 flex flex-col gap-6">
<div class="space-y-2">
<h2 class="font-display font-extrabold text-4xl leading-[1.1] text-gray-900 dark:text-white">
                        Record the taste <br/>
<span class="text-primary">of your travels</span>
</h2>
<p class="text-gray-500 dark:text-gray-400 font-medium text-lg">Rate dishes, save memories, repeat.</p>
</div>
<button class="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 text-white font-bold py-4 px-6 rounded-full shadow-glow flex items-center justify-center gap-2 text-lg">
<span class="material-icons">add_circle</span>
<span>Start New Trip</span>
</button>
</section>
<!-- Stats/Filters Horizontal Scroll -->
<div class="w-full overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
<div class="flex gap-3">
<button class="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap">
                        All Trips
                    </button>
<button class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap shadow-sm">
                        Favorites
                    </button>
<button class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap shadow-sm">
                        Map View
                    </button>
</div>
</div>
<!-- Collection List -->
<section class="flex flex-col gap-6 pb-6">
<div class="flex justify-between items-end">
<h3 class="font-bold text-xl text-gray-900 dark:text-white">Your Collections</h3>
<a class="text-primary text-sm font-semibold hover:opacity-80" href="#">View all</a>
</div>
<!-- Trip Card 1 -->
<article class="group relative w-full aspect-[4/5] sm:aspect-[4/3] rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition hover:scale-[1.01]">
<img alt="Vibrant salad bowl with fresh greens" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110" data-alt="Top down view of a vibrant salad bowl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2pplk8XxcdEZS2o7oj7SBs-yPzg1uN0xl_Fu5GzgaK6ObrdrcJhrlP0zoOqILyYlAzKaYecqdFQxBnJAfnbtZZWoxRL-AXCBDStYERYLrXIBGe38849sKQI6Ol5hJU0Mmo32uUw3TK4f0INaO5kxgGpeN-v17Euz-mpXn05JNruqgCl_SN2N1Vmk8MCNT2LfPr3nSWEV3SHdfnneNuq-YElYvmgufFsBvbB1TvLxMnBsrmIeCpDzr3ccIYzSb4RxzG-jwjgcJnDs"/>
<!-- Gradient Overlay -->
<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
<!-- Content -->
<div class="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-3">
<div class="flex justify-between items-start">
<div>
<span class="bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">ONGOING</span>
<h4 class="text-white font-bold text-2xl">Tokyo Eats</h4>
</div>
<div class="flex -space-x-2">
<img alt="Avatar" class="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" data-alt="Small avatar portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBayyYzeD_FrxB3ZAH4PP4EWag7xn-DPCQnV0L9-b1W49TLtVnNgYnV-ydIw47MXEBHnev2bTGNGJcVx4OdAsovT7wBVXY6AExuWEw5fNJILf6Bxh0ZYq6et_RN248OqkHjJ5I-r9uLSg0NSusLeqKrM5CKNkHngKC4iYyizffILiQRCGL0mkT2x_yI9LUMMda-15t_-8MKRlVbEviAJ9gxmNMmmSOOFsjDRezL7iOt_muELntRKUaGBTla1IJjqKQ5iycricGyYZA"/>
<img alt="Avatar" class="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" data-alt="Small avatar portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMvEUu1qGnGTSyfoIE7z17vsY8xgvSCO9Z_E0pDuanVNn8u2XRipABz5j0-yQHkI8aUNNeoD4yFAVk5bCyJVXVM_3W_zifqev504IiShGO-T_ro2IgK41-qRx-z1CQsIS5c6jDyDS1G5PDcFKeJrmmpQLrdH7Q6yqNp8f0U62op-B7fsrsSqQShRxarPl4KzNdLmTHCsDRoPdjRvmKz1nuDJ9lW61mm4pRAmCcxJ_DqO9E85YHpi-qQ-ULX6Sn17N61MITuBwj7K0"/>
<div class="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs text-white font-medium">+2</div>
</div>
</div>
<div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 mt-1">
<p class="text-gray-300 text-xs font-medium uppercase tracking-wider mb-1">Top Rated</p>
<div class="flex justify-between items-center">
<span class="text-white font-semibold text-sm">Tsukiji Sushi Master</span>
<div class="flex text-primary">
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
</div>
</div>
</div>
</div>
</article>
<!-- Trip Card 2 -->
<article class="group relative w-full aspect-[4/5] sm:aspect-[4/3] rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition hover:scale-[1.01]">
<img alt="Grilled meats on a barbecue" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110" data-alt="Close up of grilling meats" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvuj3CZSfc3Tn2XT89ntmjpAbnicc_Ixz8GffDIu_sB0W0InmjlXav32Mr9dq0znC5aUl-FapBaGSVkJmS0GkkSuicjrTea6ehnwGHWTkDeHN3I4BWPaKP_rhYvyXrZ3Tr2BqFDUUai8r7JFxHfPcBclWiJyRyAM-73XnXdgaXrotW3bZP90Xw-5x2xrEtVdtzy_fDQyjDrlp7Ab0YXG42P8QXLYKwM4HQ0g-drF07UecZ7dmgxxdhE5COlb6EzHomIHQmWFiml80"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
<div class="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-3">
<div class="flex justify-between items-start">
<div>
<span class="bg-gray-800/80 backdrop-blur-sm text-gray-200 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">COMPLETED</span>
<h4 class="text-white font-bold text-2xl">Seoul Food Tour</h4>
</div>
<div class="flex -space-x-2">
<img alt="Avatar" class="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" data-alt="Small avatar portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRLI7K972O_ELDkJnQYa-JZyijNuZKKTIDTXgxD28vSvnbnoKE5xYnWFPERqwmvIZBI3UWcGyRTxCin9gyxqXzCozkU1BUkWZl0zMFXm9fvvCIX0hb6neYttmksd_ZBPt1i1CWfpj8CX_wmUZlssTDV7lcs0Fqd2FvubFgB_Pt25V9Cnc9njkQ-r22VnoTjhvIKH6xtAscUOTF9uI4_GW5hOILsJGlArFyEVwYYwmt1vGpuyXI-x4yY4ZxpIy7uZrRxkpFvCf7HR8"/>
</div>
</div>
<div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 mt-1">
<p class="text-gray-300 text-xs font-medium uppercase tracking-wider mb-1">Top Rated</p>
<div class="flex justify-between items-center">
<span class="text-white font-semibold text-sm">Spicy Tteokbokki</span>
<div class="flex text-primary">
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm text-gray-500">star</span>
</div>
</div>
</div>
</div>
</article>
<!-- Trip Card 3 -->
<article class="group relative w-full aspect-[4/5] sm:aspect-[4/3] rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition hover:scale-[1.01]">
<img alt="Delicious pizza with basil" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110" data-alt="Flat lay of a pizza" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkJOMDInmuTExo14GRgAeSzxjsfRDWuxS55qZIhZR2DRG3SvaXmfrtWuWSTxl6a4PlfL7qhVyFuWgMNYFUUovOGifLG9wAAEVR1REx-UDKbEQMrsMtO_PnBg55emvWn9ve__bvpWasfmmWEwrioMfn2SDQeRxpAPEx8FdHEarKcvvG5scef90JybSoDEJUFU2qSkhRcB_m11Bs_vl2MhlLM2pZ7-cOng42E9x3fxR1NLeYwLhLzsGZG5NNKkdRdT5Vql31WeOYVQM"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
<div class="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-3">
<div class="flex justify-between items-start">
<div>
<span class="bg-gray-800/80 backdrop-blur-sm text-gray-200 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">COMPLETED</span>
<h4 class="text-white font-bold text-2xl">Napoli Pizza Hunt</h4>
</div>
<div class="flex -space-x-2">
<img alt="Avatar" class="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" data-alt="Small avatar portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiUBZIyWJDRHFYndDNHko8TtePzYV6zEQBV1oDeFu1861YcfsDTfTJs8nwZprVyok4p5lBy3v0dNCFeH1GFRuKr3FNnXUg_7cg8OIUs--2KT_ifcHoChkajfAWsaZhiYPfaco0bEshSsd3lp9wDm4so5phkGOocpdbI4C_PbAOxEiYTdjnyTohQDx7IJpUbBEvxZ-Uz49tWFnRHImUBUQJ2Ew_kUDqjywjj7mFfahlD724-BdJkFP5gb53IMxZPhVS71Cr_WpoCCo"/>
<div class="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs text-white font-medium">+1</div>
</div>
</div>
<div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 mt-1">
<p class="text-gray-300 text-xs font-medium uppercase tracking-wider mb-1">Top Rated</p>
<div class="flex justify-between items-center">
<span class="text-white font-semibold text-sm">L'Antica Pizzeria</span>
<div class="flex text-primary">
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star</span>
<span class="material-icons text-sm">star_half</span>
</div>
</div>
</div>
</div>
</article>
</section>
</main>
<!-- Bottom Navigation Bar -->
<nav class="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20">
<div class="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center gap-8 max-w-sm w-full justify-between">
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-icons">home</span>
<span class="text-[10px] font-bold">Home</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
<span class="material-icons">search</span>
<span class="text-[10px] font-medium">Search</span>
</button>
<!-- Floating Add Button in Nav -->
<div class="-mt-8">
<button class="bg-primary shadow-lg shadow-primary/40 text-white w-14 h-14 rounded-full flex items-center justify-center transform transition active:scale-95">
<span class="material-icons text-2xl">add</span>
</button>
</div>
<button class="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
<span class="material-icons">bookmark</span>
<span class="text-[10px] font-medium">Saved</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
<span class="material-icons">person</span>
<span class="text-[10px] font-medium">Profile</span>
</button>
</div>
</nav>
</div>
</body></html>

<!-- Travel Collection Details -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TasteRank - Collection Details</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Google Fonts: Plus Jakarta Sans -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&amp;display=swap" rel="stylesheet"/>
<!-- Material Icons -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec7f13",
                        "primary-light": "#fdf2e7", // Light wash of primary for backgrounds
                        "primary-dark": "#b8620e",
                        "background-light": "#f8f7f6",
                        "background-dark": "#221910",
                        "surface-dark": "#362b20", // Slightly lighter dark background for cards
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "2xl": "1.5rem", "3xl": "2rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Hide scrollbar for clean UI */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* iOS safe area padding top/bottom simulation */
        body {
            padding-bottom: env(safe-area-inset-bottom);
        }
    </style>

<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100 min-h-screen relative antialiased selection:bg-primary selection:text-white">
<!-- Main Container -->
<main class="w-full max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark relative pb-24 shadow-2xl overflow-hidden">
<!-- Header Section -->
<header class="relative h-[420px] w-full group">
<!-- Back Button (Floating) -->
<button class="absolute top-12 left-6 z-20 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/30 transition-all">
<span class="material-icons-round text-xl">arrow_back</span>
</button>
<!-- Share/More Button (Floating) -->
<button class="absolute top-12 right-6 z-20 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/30 transition-all">
<span class="material-icons-round text-xl">ios_share</span>
</button>
<!-- Hero Image -->
<div class="absolute inset-0 w-full h-full">
<img alt="Bustling Osaka street food market at night with lanterns" class="w-full h-full object-cover" data-alt="Bustling Osaka street food market at night with lanterns" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVJcrPdiXStESW0ceFZJE_BXtlkzkUOoNpzCe_u-rofJ2BhBPmTCKpqtjQ8K95IqEHHJqhksbKOQF6pYFCrUNRPltR8nW5rMeaNo8GxbzDR8Nb3gnTQJGXy1lCAnxtD9KjKyR3A0yg95v3WpCX6zG-_wA2YfQBOSmfTNKMUYXChMHj8YT6k-g0ngSV2Ch5E3pohmLLBRq6VCpMpPuLJMU5n6jrgmfY_C4KNEjfDfwMTEQ7QIdy2vQg-HKeTXGq3kyVd9wDMGyWqd0"/>
<!-- Gradient Overlay -->
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent"></div>
</div>
<!-- Content Overlay -->
<div class="absolute bottom-0 left-0 w-full p-6 z-10">
<!-- Badges -->
<div class="flex items-center gap-3 mb-3">
<span class="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg shadow-primary/30">
                        Ongoing
                    </span>
<span class="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/10 flex items-center gap-1">
<span class="material-icons-round text-[14px]">calendar_today</span>
                        Oct 24 - Nov 01
                    </span>
</div>
<!-- Title -->
<h1 class="text-4xl font-bold text-white mb-2 leading-tight tracking-tight drop-shadow-sm">
                    Osaka Street<br/>Food Tour 🎌
                </h1>
<!-- Trip Meta -->
<div class="flex items-center justify-between mt-4">
<!-- Avatars -->
<div class="flex items-center -space-x-3">
<img alt="Woman portrait smiling" class="w-10 h-10 rounded-full border-2 border-background-dark object-cover" data-alt="Woman portrait smiling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAONXscEZZaO23rr72K9dbmSfnpnkFxMoqkYo_PB1wUgRZvsJoRBiuRJD5gl5lclwohB1RcTR8DzczrT1LBexvykaDvCiowLzM6BiiD3KKFamyDOPlvcvAJMI_20SPLKPRhDTqQY0qII_3fJicGDDxY5drFRmE9L9UsiiVs-hIEz5FLcfW0tT12vhbTPEYO3-493KKGcBYwVbjUn_sqycfSfIUoTMdy69VsJKtSuqxBW1mlBuggJhSwVfpUfDdHmSTQdRnlzxJdpaA"/>
<img alt="Man portrait neutral expression" class="w-10 h-10 rounded-full border-2 border-background-dark object-cover" data-alt="Man portrait neutral expression" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz4XOKDETWGcHb5aP8F8VEjKDGkNrl7g7s4zxsVOaTABGDlFqMHqDFfivNkDV4sMcb0LYrSd6yGtlA2v8tUgQLalH5Dvl438CxbPWbwksuRqCRF3FwF-EtAJEnNWBEYcR4i_OEIpiWHGh1WEB3q1tLPLrgosrRJ0mMtYDUQ-q6quWdDd3WQ9rtH_6N2q3tKC_Enss-dPvXP6Ntrt0vFVCLA5ZXbbetl53ougFAMSfrtyn70hq46zmWRK-DGocK_0dy0ULncxTFKbU"/>
<img alt="Woman with curly hair smiling" class="w-10 h-10 rounded-full border-2 border-background-dark object-cover" data-alt="Woman with curly hair smiling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAysKTnD_VHGgOHyIK1W3AMFD6aRF6ypOhW7QraI_mfkpQqHfZfMd0E9zipNu5M3OPB7t_hIniUuS0G4BitXUA6Ryjd-Nv2njW-g16BjPQhYNmyGf_Zoa4T-W9OxFAqJZMhTvwrYspPTnk7u_DLAwBsFiFbkxVme_ghXTrwPtUh8pOjorKvwoXwlEQkp3Q8VUnpH6cQRI-FdA__vI3Had3dxFBOV-nIwHJPxRcCaXIEWKJwFQXb0h4d5Iu3OxPiQK3S4BwinRGMcVI"/>
<div class="w-10 h-10 rounded-full border-2 border-background-dark bg-surface-dark text-white flex items-center justify-center text-xs font-bold">
                            +1
                        </div>
</div>
<!-- Location Pin -->
<div class="flex items-center text-white/80 text-sm font-medium">
<span class="material-icons-round text-primary mr-1">location_on</span>
                        Osaka, Japan
                    </div>
</div>
</div>
</header>
<!-- Sticky Navigation Tabs -->
<div class="sticky top-0 z-30 bg-background-light dark:bg-background-dark pt-4 pb-2 px-6 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)]">
<div class="flex bg-white dark:bg-surface-dark p-1.5 rounded-full relative">
<!-- Tab Indicator (Animated concept via positioning) -->
<div class="w-1/2 absolute left-1.5 top-1.5 bottom-1.5 bg-primary rounded-full shadow-md z-0 transition-all"></div>
<button class="flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white transition-colors">
<span class="material-icons-round text-base">restaurant_menu</span>
                    Food List
                </button>
<button class="flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
<span class="material-icons-round text-base">emoji_events</span>
                    Ranking
                </button>
</div>
</div>
<!-- Content Grid -->
<div class="px-5 py-6 space-y-6">
<!-- Section Header: Top Rated Today -->
<div class="flex items-center justify-between mb-2">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Eats</h3>
<button class="text-primary text-sm font-semibold flex items-center">
                    Filter <span class="material-icons-round text-base ml-1">tune</span>
</button>
</div>
<!-- Masonry-style Grid -->
<div class="grid grid-cols-2 gap-4">
<!-- Card 1 -->
<div class="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
<div class="relative aspect-[4/5] overflow-hidden">
<img alt="Fresh nigiri sushi plate" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Fresh nigiri sushi plate" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8fcuyQ3_HCjB54QTe6h3WNIHB7ILyzjxEvDuM15j8jAYaSuPR_GEFmOUH_uSQJ79LbkzGy_7d7uJiOCRzghrlE51YEMHXV5p5vhVHfG6IuuPfymhtPStA1OrPuKRhAHmjKV1bAq7Cnqr_f1zcxL9wYfKHHXco1LPJsOk7zagaxn0Oh7JSYrhoT5FxrgLNjiXiObbNl66B6ARwo3E3JYUKNf81n_1ql_U6dGhkyG5RbDkxrex_UsH2x0e4emWdZWU5qeg9ggzRkqA"/>
<!-- Rating Badge -->
<div class="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span class="material-icons-round text-primary text-xs">star</span>
<span class="text-xs font-bold text-slate-900 dark:text-white">9.8</span>
</div>
<div class="absolute bottom-3 left-3">
<button class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors">
<span class="material-icons-round text-sm">favorite_border</span>
</button>
</div>
</div>
<div class="p-3">
<h4 class="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">Omakase Course</h4>
<p class="text-xs text-slate-500 dark:text-slate-400 truncate">Sushi Endo • $$$</p>
</div>
</div>
<!-- Card 2 -->
<div class="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mt-8">
<div class="relative aspect-square overflow-hidden">
<img alt="Green matcha ice cream cone" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Green matcha ice cream cone" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv-dsPtl-lHyqaWa62mcWg4X_RigbMatTxYJhNT58SpQR_khW1P0vNrBeieSQKUp2yPGRPxQ18m5-b8UYbqO6XSsA4uBHDk8S83zp8Nw4-fqxuMWpuY5mn9kh0M99J_0D2MXoItfeuMxCeaF1LiOqMWUB-ZgB7ve4ULhetNsee4cj1DETgjR5bYrcXIBW2pL1Swn0vjoqzNLSFl9fHzmTX35Gkh-O_jTb8W-7PF7OH7-h-POk3jdA9cNEkCxJj5G6uYLxZ2WZ0Xjg"/>
<div class="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span class="material-icons-round text-primary text-xs">star</span>
<span class="text-xs font-bold text-slate-900 dark:text-white">8.5</span>
</div>
</div>
<div class="p-3">
<h4 class="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">Matcha Soft Serve</h4>
<p class="text-xs text-slate-500 dark:text-slate-400 truncate">Street Vendor • $</p>
</div>
</div>
<!-- Card 3 -->
<div class="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
<div class="relative aspect-square overflow-hidden">
<img alt="Takoyaki balls with sauce and bonito flakes" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Takoyaki balls with sauce and bonito flakes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHfRiCDetzqVq7_2lkWlvcT1gyWAZwd_FSiCY-zFFdXXhYnRZqcVKSsBAYzYprn8hmEUCqF4dE2gP6Wja8L-JOx9ENy1On4mrXesNWcpwwpF6UiaRaoYA-NaPTcIHNCrBzqXr4BOslAe6U0R5iaEh1Sq6IJarHrrLgnVNzJ5D9cLK--S25Uap-8GJ7HJYzhVFZL9wWhm_0rSAmqQsBSXal-CI0sPuNxsnpw66-VAZN2iOCcAHHDQX4hi_oTFucbXyXdYXgKK5bfbI"/>
<div class="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span class="material-icons-round text-primary text-xs">star</span>
<span class="text-xs font-bold text-slate-900 dark:text-white">9.2</span>
</div>
</div>
<div class="p-3">
<h4 class="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">Takoyaki</h4>
<p class="text-xs text-slate-500 dark:text-slate-400 truncate">Dotonbori Stand • $</p>
</div>
</div>
<!-- Card 4 -->
<div class="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mt-[-32px]">
<div class="relative aspect-[4/5] overflow-hidden">
<img alt="Bowl of spicy ramen with pork and egg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Bowl of spicy ramen with pork and egg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUptZUvRc-shpriQsvU22WzGtC0WtlltHOU-odDclVMDKL0FFxBM0KvlYtOg1rvNkOSg7fJy1zkrcqO2FN8NqI50qa0lUxJGBgYEfYPbU9Vk3Mx_pkcQjk3HeZ5hff7rmC3nCzlJPrj-HDLibxXVMShfZbSWP2c7MXla28qek2l6sgm1Hp4p5htcSo2hMkleCRqvmf3G_95dZ06I7EuCJXVR7NsrY3v6DLa7f4f4-4RQ31I3Sxq4fdPRNoQARSgMsHPXCXQnTjNj0"/>
<div class="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span class="material-icons-round text-primary text-xs">star</span>
<span class="text-xs font-bold text-slate-900 dark:text-white">9.5</span>
</div>
<div class="absolute bottom-3 left-3">
<button class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors">
<span class="material-icons-round text-sm">favorite</span>
</button>
</div>
</div>
<div class="p-3">
<h4 class="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">Ichiran Ramen</h4>
<p class="text-xs text-slate-500 dark:text-slate-400 truncate">Dotonbori • $$</p>
</div>
</div>
<!-- Card 5 -->
<div class="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
<div class="relative aspect-[4/5] overflow-hidden">
<img alt="Wagyu beef skewer sizzling on grill" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Wagyu beef skewer sizzling on grill" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQwG60M7X-7vRxH8Rze3IgaXyLl7-rpN5KsME-zb5JyDpV3J1fUdGEmDc2IYtjBC_vH7_cKspycuxU7hiblppaOePnqwX2WtL30vjDYBiHM0bXmIZLLpRN-B9G3Onzd_d2w4INyIa-O_m2kH5BC7dty9wZ-CNHN2Gx1HAtHsLco5ugsAj5HdZ_DGRgKOT7-YfAGsZu0JGQy1VM-roGY2s_zwlTaFA29FWRErWfn5cSd3wAM_6SYO4lRQnNhGJXYvlwfGrfeOtVOm8"/>
<div class="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span class="material-icons-round text-primary text-xs">star</span>
<span class="text-xs font-bold text-slate-900 dark:text-white">10.0</span>
</div>
</div>
<div class="p-3">
<h4 class="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">Kobe Beef Skewer</h4>
<p class="text-xs text-slate-500 dark:text-slate-400 truncate">Kuromon Market • $$$$</p>
</div>
</div>
<!-- Card 6 -->
<div class="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mt-[-32px]">
<div class="relative aspect-square overflow-hidden bg-primary/10 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 p-4 text-center">
<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
<span class="material-icons-round">add_a_photo</span>
</div>
<p class="text-xs font-medium text-slate-500 dark:text-slate-400">Add more photos<br/>from your trip</p>
</div>
</div>
</div>
<!-- Bottom spacer for FAB -->
<div class="h-16"></div>
</div>
<!-- Floating Action Button (FAB) -->
<button class="fixed bottom-6 right-6 z-40 w-16 h-16 bg-primary text-white rounded-full shadow-[0_8px_30px_rgb(236,127,19,0.4)] flex items-center justify-center hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 group">
<span class="material-icons-round text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
</button>
</main>
</body></html>

<!-- Food Rankings -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Food Rankings - TasteRank</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec7f13",
                        "primary-light": "#fbdcb8", // Lighter tint for backgrounds
                        "primary-dark": "#b05e0e", // Darker shade for text
                        "background-light": "#f8f7f6",
                        "background-dark": "#221910",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "1rem",
                        "lg": "2rem",
                        "xl": "3rem",
                        "2xl": "4rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        'soft': '0 10px 40px -10px rgba(236, 127, 19, 0.1)',
                        'glow': '0 0 20px rgba(236, 127, 19, 0.3)'
                    }
                },
            },
        }
    </script>
<style>
        body {
            -webkit-tap-highlight-color: transparent;
        }
        /* Hide scrollbar for clean UI */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100 min-h-screen antialiased flex justify-center selection:bg-primary selection:text-white">
<!-- Mobile Container -->
<div class="w-full max-w-md bg-white dark:bg-[#1a120b] min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
<!-- Header -->
<header class="sticky top-0 z-40 bg-white/90 dark:bg-[#1a120b]/90 backdrop-blur-md border-b border-primary/10 dark:border-primary/5 pt-12 pb-2 px-6">
<div class="flex items-center justify-between mb-4">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-white">
<span class="material-icons-round text-2xl">arrow_back</span>
</button>
<div class="flex flex-col items-center">
<span class="text-xs font-semibold text-primary tracking-wider uppercase">Travel Collection</span>
<h1 class="text-lg font-bold">Best of Tokyo 🇯🇵</h1>
</div>
<button class="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-white">
<span class="material-icons-round text-2xl">share</span>
</button>
</div>
<!-- Tag Filters -->
<div class="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
<button class="px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold shadow-soft whitespace-nowrap transition-transform active:scale-95">
                    All
                </button>
<button class="px-5 py-2 bg-background-light dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap border border-transparent hover:border-primary/30 transition-all active:scale-95">
                    🍜 Ramen
                </button>
<button class="px-5 py-2 bg-background-light dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap border border-transparent hover:border-primary/30 transition-all active:scale-95">
                    🍣 Sushi
                </button>
<button class="px-5 py-2 bg-background-light dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap border border-transparent hover:border-primary/30 transition-all active:scale-95">
                    🍛 Curry
                </button>
</div>
</header>
<!-- Main Content (Scrollable) -->
<main class="flex-1 overflow-y-auto no-scrollbar pb-32">
<!-- Podium Section -->
<div class="px-6 pt-6 pb-2">
<!-- 1st Place (Large Card) -->
<div class="relative w-full aspect-[4/5] rounded-lg overflow-hidden shadow-soft mb-6 group cursor-pointer">
<!-- Image -->
<img alt="Delicious bowl of rich tonkotsu ramen with egg and pork" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="Delicious bowl of rich tonkotsu ramen with egg and pork" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtroXYdFDJye1q_jb-SxNxacOO6AhpSWy-Tw8SWPRlxxBw7VDu8SkWZfr2EAduJjaXl4XhW2M_wUoxz-t0iT7NQgDAZMWOIxb5Z7q-KmLZdUEZNWOMsQY3OWJ-HepymxSoU2PCANXFoEdR8OxJsz6AzNP6_yIFnFhRa06YvNUPQOKvoZSqk-dJ7_tRLWDwqYXm4i9mAFIMCKr9PP1TEau-4ysyYpU7fgADrf1mOJ9-zp1cgrUwttTBN_lIp5wKBTTDNR8X1AUwhbY"/>
<!-- Gradient Overlay -->
<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
<!-- Content -->
<div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full flex items-center gap-1">
<span class="material-icons-round text-yellow-400 text-sm">star</span>
<span class="text-sm font-bold">4.9</span>
</div>
<div class="absolute bottom-0 w-full p-6 text-white">
<div class="flex items-center gap-2 mb-2">
<div class="bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white/50">1</div>
<span class="text-xs font-semibold bg-primary/80 px-2 py-0.5 rounded text-white backdrop-blur-sm">Must Visit</span>
</div>
<h2 class="text-3xl font-bold mb-2 leading-tight">Ichiran Ramen</h2>
<div class="flex items-start gap-2 text-white/90 text-sm leading-snug">
<span class="material-icons-round text-primary text-base mt-0.5">format_quote</span>
<p class="italic">The solo booths are a vibe and the broth is liquid gold. Best ramen ever!</p>
</div>
</div>
</div>
<!-- 2nd & 3rd Place (Grid) -->
<div class="grid grid-cols-2 gap-4 mb-8">
<!-- 2nd Place -->
<div class="bg-background-light dark:bg-white/5 rounded-lg p-3 relative shadow-sm group active:scale-95 transition-transform">
<div class="relative aspect-square rounded-2xl overflow-hidden mb-3">
<img alt="Fresh premium sushi platter on wooden board" class="w-full h-full object-cover" data-alt="Fresh premium sushi platter on wooden board" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2Vn5gTVNX1sAkDKBh0ifLYAnWFHb_jRoiU2s0Y6-GRVKZFd5Oqq-qwyZjrNa0Y4iMQS6Bz3sTxqGfWUiEYATANpULG78Ljb9EZELojukn3RTiYBf9yERHeBMSalPL3GMpbohvlHQEMxRaEJaERRG3oHLWbBjfyFUpKE0NWYvxFstek3O7TN-ML3-9Gkt9uN-LqyT7idYygysjYt5Q4ZV1WNirtQ4XI1thLwSrjMrIdSZo-9xRrURcFT-WZhae6nJNFeDjbwMwvJA"/>
<div class="absolute top-2 left-2 bg-gray-300 text-gray-800 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-white">2</div>
</div>
<h3 class="font-bold text-gray-900 dark:text-white text-base truncate">Sushi Dai</h3>
<div class="flex items-center gap-1 mt-1">
<span class="material-icons-round text-yellow-500 text-sm">star</span>
<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">4.8</span>
<span class="text-xs text-gray-400">• Toyosu</span>
</div>
</div>
<!-- 3rd Place -->
<div class="bg-background-light dark:bg-white/5 rounded-lg p-3 relative shadow-sm group active:scale-95 transition-transform">
<div class="relative aspect-square rounded-2xl overflow-hidden mb-3">
<img alt="Crispy golden tempura shrimp and vegetables" class="w-full h-full object-cover" data-alt="Crispy golden tempura shrimp and vegetables" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7hwPV8R0QAx_zGhURsJD_QInK7F1evpDOfM4Lp4LBP_GC1tX4BPKVuWjP9aXRNrhF6daF7a9eHQKtbLHKxyJisjbqz1YKMn5jjqjV0EFRR_TDb565bViVuIb25n7s1xiMLvhyi_DUfiX8JkgnHHVmhEExrHfKwihZIwJ8zQyWK5Ce23svTZA3AV4Xl8sXetzd1qEe3-sHzRu0IRInbyfO-YkcYUM75la59WOLTm0UwKZM3NLkbXOYqMNChKfh4set7OmjPF7nrog"/>
<div class="absolute top-2 left-2 bg-amber-700 text-orange-100 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-white">3</div>
</div>
<h3 class="font-bold text-gray-900 dark:text-white text-base truncate">Tempura Kondo</h3>
<div class="flex items-center gap-1 mt-1">
<span class="material-icons-round text-yellow-500 text-sm">star</span>
<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">4.7</span>
<span class="text-xs text-gray-400">• Ginza</span>
</div>
</div>
</div>
</div>
<!-- AI Ranking Analysis -->
<div class="mx-6 mb-8 bg-gradient-to-br from-primary/10 to-orange-100/30 dark:from-primary/20 dark:to-transparent rounded-lg p-5 border border-primary/10 dark:border-primary/20 relative overflow-hidden">
<!-- Decorative Icon Background -->
<span class="material-icons-round text-primary/10 absolute -right-4 -bottom-4 text-8xl pointer-events-none">auto_awesome</span>
<div class="flex items-center gap-2 mb-2 relative z-10">
<span class="material-icons-round text-primary">auto_awesome</span>
<h3 class="font-bold text-primary-dark dark:text-primary text-sm uppercase tracking-wide">AI Taste Analysis</h3>
</div>
<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
<span class="font-semibold text-gray-900 dark:text-white">Summary:</span> This collection heavily favors rich umami profiles. Users frequently mention <span class="bg-primary/10 text-primary-dark dark:text-primary px-1 rounded text-xs font-bold">broth depth</span> and <span class="bg-primary/10 text-primary-dark dark:text-primary px-1 rounded text-xs font-bold">solo dining</span> experiences as key ranking factors this month.
                </p>
</div>
<!-- 4th+ Place List -->
<div class="px-6 space-y-4">
<h4 class="text-gray-500 text-xs font-bold uppercase tracking-wider ml-1">Runners Up</h4>
<!-- Item 4 -->
<div class="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-xl active:bg-gray-50 dark:active:bg-white/10 transition-colors cursor-pointer">
<div class="relative w-16 h-16 flex-shrink-0">
<img alt="Plates of dumplings and noodles on a table" class="w-full h-full object-cover rounded-lg" data-alt="Plates of dumplings and noodles on a table" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqh0UHx0zSLDrtan97NUmi5s7wRv5LvGyhurqy-86xz-melio0iHsRfKAiZQFHNUEBRdfxon6eGso3ZWjsVJGynPVx20m5Aj_AGKWWim6kyMuw9RpVyXZWvZqWfwoicwZscPw99WtsElbRxn7_c5vxZUBQ1KMX6-1N1N4Ej7S_ZGJDJi71A8B54fZV58ijZYzm9NrKNM-bvanQBvi7Wvm3fO1MGigUfHhmG41QRL-7oe09ovPGuk74RoQITYqywGzK0zYh_JbISak"/>
<div class="absolute -top-1 -left-1 w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a120b]">4</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start">
<h4 class="font-bold text-gray-900 dark:text-white truncate">Afuri Ramen</h4>
<div class="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-bold">
<span class="material-icons-round text-yellow-500 text-[10px]">star</span> 4.6
                            </div>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">Known for their signature Yuzu broth.</p>
</div>
</div>
<!-- Item 5 -->
<div class="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-xl active:bg-gray-50 dark:active:bg-white/10 transition-colors cursor-pointer">
<div class="relative w-16 h-16 flex-shrink-0">
<img alt="Golden fried beef cutlet gyukatsu" class="w-full h-full object-cover rounded-lg" data-alt="Golden fried beef cutlet gyukatsu" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgZwwHo1w8Td6-e1D81i03_KNunIMb4W9VMblduH2HvaXaxhUF4oZybiChOwTwwyPuUquT0YCYlOUS9pP5T3L96Q7zEtd27_AgG9-q4DZWueS336RsvArwyOnhb5Sig2TF2KjsbkB8IIc5CHmiBCWixXw3R-SntS75fSzYz34qHVaXLAb7G-blwSJV3467jzZfPdxet67JiGRMwRbZciyztZoaYBIGn7rABkJJ_hv-WgzepBtgiNVK6RA6phBVhphz6BL83N21wwA"/>
<div class="absolute -top-1 -left-1 w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a120b]">5</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start">
<h4 class="font-bold text-gray-900 dark:text-white truncate">Gyukatsu Motomura</h4>
<div class="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-bold">
<span class="material-icons-round text-yellow-500 text-[10px]">star</span> 4.5
                            </div>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">Stone-grilled beef cutlets.</p>
</div>
</div>
<!-- Item 6 -->
<div class="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-xl active:bg-gray-50 dark:active:bg-white/10 transition-colors cursor-pointer">
<div class="relative w-16 h-16 flex-shrink-0">
<img alt="Pan fried gyoza dumplings" class="w-full h-full object-cover rounded-lg" data-alt="Pan fried gyoza dumplings" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw2Si6CSrYr1CYpDp9znk24eCRMvzpvUr_h0UZWTGEg17gAgokeLq6sMnZG6IQvfG87HQAISxNqDdhKdcs9zmIrJwxsUtZQVS5nfiRj4PFBINvUcRkWSpJrpYnJhta-gHeR5LSYbGYtLzn1NWYF4_buZrVBmWKvfUBMNTsTHicx_8ly0okJm8Nm6CnUuMc66MVLCzFZP3T_mpvkY3_696aycl6Zg6Cz3KA4Lx20c-7pc8Oz6W7fNPBBCPzdZMxout_2pq7dGnvjVk"/>
<div class="absolute -top-1 -left-1 w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a120b]">6</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start">
<h4 class="font-bold text-gray-900 dark:text-white truncate">Harajuku Gyozaro</h4>
<div class="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-bold">
<span class="material-icons-round text-yellow-500 text-[10px]">star</span> 4.5
                            </div>
</div>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">Simple, delicious dumplings.</p>
</div>
</div>
</div>
<!-- Bottom Spacer -->
<div class="h-8"></div>
</main>
<!-- Floating Action Button / Bottom Bar -->
<div class="absolute bottom-6 left-0 right-0 px-6 z-30 flex justify-center">
<button class="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all group overflow-hidden relative">
<!-- Shine effect -->
<div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
<span class="material-icons-round">emoji_events</span>
<span>Play Food World Cup</span>
</button>
</div>
<!-- Bottom Safe Area Fade -->
<div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#1a120b] to-transparent pointer-events-none z-20"></div>
</div>
<style>
        @keyframes shimmer {
            100% {
                transform: translateX(100%);
            }
        }
    </style>
</body></html>

<!-- Add Food Record -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TasteRank - Add Food Record</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec7f13",
                        "background-light": "#f8f7f6",
                        "background-dark": "#221910",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom styles for range slider thumb */
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 28px;
            width: 28px;
            border-radius: 50%;
            background: #ffffff;
            border: 4px solid #ec7f13;
            cursor: pointer;
            margin-top: -10px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 8px;
            cursor: pointer;
            background: #e5e7eb;
            border-radius: 9999px;
        }
        /* Hide scrollbar for clean look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100 antialiased selection:bg-primary/30">
<!-- Mobile Container -->
<div class="mx-auto max-w-md min-h-screen bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative pb-24">
<!-- Header / Nav -->
<div class="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6 bg-gradient-to-b from-black/50 to-transparent">
<button class="text-white/90 hover:text-white backdrop-blur-sm bg-black/20 rounded-full px-4 py-1.5 text-sm font-medium transition">
                Cancel
            </button>
<span class="text-white font-bold text-lg drop-shadow-md">New Memory</span>
<button class="text-white/90 hover:text-white backdrop-blur-sm bg-black/20 rounded-full p-2 transition">
<span class="material-icons-round text-xl">more_horiz</span>
</button>
</div>
<!-- Photo Area -->
<div class="relative h-[42vh] w-full rounded-b-xl overflow-hidden shadow-lg group">
<img alt="Delicious poke bowl with fresh ingredients" class="w-full h-full object-cover" data-alt="Close up of a vibrant colorful food bowl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe_BegeM0TGCbAs4jaH873HSsvo3KukZGMCaowSna-O2cPD9EPnJmNXrKFRSodkUMsfLlxIUOuTOkHvC9fd5jYpIAJahhPu7MxXINLLDpNhSZA_7rH2m2OAQMLA9CPhYmvGW67_quOnbLOuXsPOmMgg02kYPHgZAnIcGAnM3uQcmoRdmGB6Kt-DZLeA19h7yFooC7XLkiyWL_-VEbSti1qYOkqLEXJHJh-hp2dzNSTtAmH-lE9pQwy8NWuy6Z-IiKgKVjk0nN-Rik"/>
<!-- Photo Upload Overlay/Button -->
<div class="absolute bottom-6 right-6">
<button class="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg shadow-primary/30 transform transition active:scale-95 flex items-center justify-center">
<span class="material-icons-round text-2xl">add_a_photo</span>
</button>
</div>
<!-- Swipe Indicator -->
<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
<div class="w-6 h-1.5 bg-white rounded-full shadow-sm"></div>
<div class="w-1.5 h-1.5 bg-white/50 rounded-full backdrop-blur-sm"></div>
<div class="w-1.5 h-1.5 bg-white/50 rounded-full backdrop-blur-sm"></div>
</div>
</div>
<!-- Main Content Scroll Area -->
<div class="px-6 -mt-8 relative z-10 space-y-8">
<!-- Core Data Input Card -->
<div class="bg-white dark:bg-[#2c241b] rounded-xl p-6 shadow-sm border border-orange-100 dark:border-white/5 space-y-5">
<!-- Food Name -->
<div class="space-y-1">
<label class="text-xs font-bold text-primary uppercase tracking-wider">What did you eat?</label>
<input class="w-full text-2xl font-extrabold bg-transparent border-0 border-b-2 border-gray-100 dark:border-white/10 focus:border-primary focus:ring-0 px-0 py-2 placeholder-gray-300 dark:placeholder-white/20 text-gray-900 dark:text-white transition-colors" placeholder="e.g. Spicy Miso Ramen" type="text"/>
</div>
<!-- Restaurant/Location -->
<div class="space-y-1 relative">
<label class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Where was it?</label>
<div class="flex items-center">
<span class="material-icons-round text-gray-400 dark:text-gray-500 mr-2">place</span>
<input class="w-full font-medium bg-transparent border-none focus:ring-0 px-0 py-1 placeholder-gray-300 dark:placeholder-white/20 text-gray-700 dark:text-gray-200" placeholder="Add location..." type="text"/>
</div>
</div>
</div>
<!-- Score Slider Section -->
<div class="space-y-4">
<div class="flex justify-between items-end px-1">
<h3 class="font-bold text-lg text-gray-800 dark:text-white">Taste Score</h3>
<span class="text-3xl font-extrabold text-primary">8.5</span>
</div>
<div class="relative py-2">
<!-- Custom Gradient Background for Slider -->
<div class="absolute top-1/2 left-0 right-0 h-2 -mt-1 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 opacity-20 dark:opacity-30"></div>
<input class="w-full relative z-10 bg-transparent appearance-none h-2 cursor-pointer focus:outline-none [&amp;::-webkit-slider-thumb]:border-primary [&amp;::-webkit-slider-thumb]:shadow-primary/20" max="10" min="1" step="0.1" type="range" value="8.5"/>
<div class="flex justify-between text-xs font-medium text-gray-400 mt-2 px-1">
<span>Meh 😕</span>
<span>Okay 😐</span>
<span>Amazing 🤩</span>
</div>
</div>
</div>
<!-- AI Tags Section -->
<div class="space-y-3">
<div class="flex items-center gap-2 px-1">
<span class="material-icons-round text-primary text-sm">auto_awesome</span>
<h3 class="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wide">AI Recommended Tags</h3>
</div>
<div class="flex overflow-x-auto gap-3 pb-2 no-scrollbar mask-linear-fade">
<!-- Selected Tag -->
<button class="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-primary/20 whitespace-nowrap transition transform active:scale-95">
<span class="material-icons-round text-base">local_fire_department</span>
                        Spicy
                    </button>
<!-- Unselected Tags -->
<button class="bg-white dark:bg-[#3a2e22] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-orange-50 dark:hover:bg-white/5 transition">
                        Umami Rich
                    </button>
<button class="bg-white dark:bg-[#3a2e22] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-orange-50 dark:hover:bg-white/5 transition">
                        Crunchy
                    </button>
<button class="bg-white dark:bg-[#3a2e22] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-orange-50 dark:hover:bg-white/5 transition">
                        Authentic
                    </button>
<button class="bg-white dark:bg-[#3a2e22] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-orange-50 dark:hover:bg-white/5 transition">
                        Sweet
                    </button>
</div>
</div>
<!-- Foldable AI Questions Section -->
<div class="bg-orange-50 dark:bg-primary/10 rounded-xl overflow-hidden border border-orange-100 dark:border-primary/20">
<details class="group">
<summary class="flex justify-between items-center p-5 cursor-pointer list-none">
<div class="flex items-center gap-3">
<div class="bg-primary/20 text-primary rounded-full p-2">
<span class="material-icons-round text-xl">psychology</span>
</div>
<div class="text-left">
<h4 class="font-bold text-gray-900 dark:text-white text-sm">AI Food Critic</h4>
<p class="text-xs text-gray-500 dark:text-gray-400">Answer 2 quick questions to improve ranking</p>
</div>
</div>
<span class="material-icons-round text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="px-5 pb-5 pt-0 space-y-4 border-t border-orange-100 dark:border-primary/10 mt-2">
<!-- Question 1 -->
<div class="pt-4">
<p class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Was the broth texture consistent with local style?</p>
<div class="flex gap-2">
<button class="flex-1 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 hover:border-primary text-gray-600 dark:text-gray-300 transition">Yes</button>
<button class="flex-1 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 hover:border-primary text-gray-600 dark:text-gray-300 transition">No</button>
<button class="flex-1 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 hover:border-primary text-gray-600 dark:text-gray-300 transition">Unsure</button>
</div>
</div>
<!-- Question 2 -->
<div>
<p class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">How was the spice level?</p>
<div class="flex gap-2">
<button class="flex-1 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 hover:border-primary text-gray-600 dark:text-gray-300 transition">Mild</button>
<button class="flex-1 py-2 text-xs font-semibold rounded-lg bg-primary text-white border border-primary shadow-sm transition">Perfect</button>
<button class="flex-1 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 hover:border-primary text-gray-600 dark:text-gray-300 transition">Too Hot</button>
</div>
</div>
</div>
</details>
</div>
<!-- Extra Spacer for fixed button -->
<div class="h-20"></div>
</div>
<!-- Fixed Bottom Action Button -->
<div class="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pointer-events-none z-30 max-w-md mx-auto">
<button class="pointer-events-auto w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 rounded-full shadow-xl shadow-primary/25 flex items-center justify-center gap-2 transform transition active:scale-[0.98]">
<span class="material-icons-round">save</span>
                Save Record
            </button>
</div>
</div>
</body></html>

<!-- Food Details -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Food Details - TasteRank</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec7f13",
                        "background-light": "#f8f7f6",
                        "background-dark": "#221910",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        /* Hide scrollbar for clean carousel */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 antialiased selection:bg-primary/30">
<div class="mx-auto max-w-md bg-white dark:bg-[#1a120b] min-h-screen relative shadow-2xl overflow-hidden">
<!-- Header / Hero Section -->
<header class="relative w-full h-[400px]">
<!-- Navigation Overlay -->
<div class="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start pt-12 bg-gradient-to-b from-black/60 to-transparent">
<button class="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-3 transition-all active:scale-95">
<span class="material-icons text-xl">arrow_back</span>
</button>
<div class="flex gap-3">
<button class="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-3 transition-all active:scale-95">
<span class="material-icons text-xl">share</span>
</button>
<button class="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-3 transition-all active:scale-95">
<span class="material-icons text-xl">favorite_border</span>
</button>
</div>
</div>
<!-- Carousel Images -->
<div class="flex overflow-x-auto snap-x snap-mandatory h-full hide-scrollbar w-full">
<div class="min-w-full snap-center relative">
<img alt="Spicy Miso Ramen bowl close up" class="w-full h-full object-cover" data-alt="Close up of delicious spicy miso ramen with pork and egg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGAtrtfHLOXiZenFSH1XiI_GcOKD7K5EvvAtQdaiQz9m6dRQ9svCWKDhSOVJRkoOEsVh6tWrwIiFWRU7Y5v7GHspX4Csa5LHVMjihh8yB3aSBQtElqSCGl85ZHl7VTd86tAUiVcKPGB7GHItCM2JLq6GTUQ3BazTx0r5At6hzLNwE7lSjPijEVAzP-tz7ls4gMfg6D_Hc5vxDcur0SkLPi8lTZZqQD4ADbzWZcO2LWUTUBjpJrtYsKlVadXV4aSS-U5VqGtaRiOkY"/>
</div>
<div class="min-w-full snap-center relative">
<img alt="Ramen ingredients flat lay" class="w-full h-full object-cover" data-alt="Ingredients of ramen laid out beautifully" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ9aY3BxK7M1Nz_b9PLvyk7Zsu4vK9Z1io7Lu7aZuo1-l4kyU1xIZH3mgkL0XGOu-SREPJOHuoFZLDyOirpR6fzFupsQnoUwr13eejKAU3ZwhsOhlphgW9fpqp_LcFswQ3Q1A4oWTh_zZVveR5_KTh4bmTSgLjfBrgIanuZ_h2suyssn1GdyeW-a9HjqcQG0NhWscB-2YyNHN1fCco91MSSB4H5otBGo3lJW6p4wZV3-t11it7kSSXtMws0K6h2afx2WTUVWH9unA"/>
</div>
<div class="min-w-full snap-center relative">
<img alt="Restaurant interior warm lighting" class="w-full h-full object-cover" data-alt="Cozy warm restaurant interior with wooden tables" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKE1qcHnxcyZDZXHG4SAMhu7kNAw6f4zxwW6kfxTQPLDaXiVb9rd7Qf3g8rJrL0oDcdifC-8pWkPVTWiyr5RK8gTNikU01esE0qrdWpRU1_AddsMYG2yHMGs6cZHayqb8WewB_MwqpQ7GJ9PfqPk8RZ_7AmZ0XlmtXVZMTqoMB2CVOwFCShmzgjZQcZLJnTeghzdFCyRUYbzUhh0wkG0usFriok6Z9QH7CmduvatoEiYLNwRWZx9nrfi_a8ktVFVj-iuho5KGQNzo"/>
</div>
</div>
<!-- Pagination Dots -->
<div class="absolute bottom-10 left-0 w-full flex justify-center gap-2 z-20">
<div class="w-6 h-1.5 bg-primary rounded-full shadow-sm"></div>
<div class="w-1.5 h-1.5 bg-white/60 rounded-full backdrop-blur-sm"></div>
<div class="w-1.5 h-1.5 bg-white/60 rounded-full backdrop-blur-sm"></div>
</div>
<!-- Curved Overlay to blend into content -->
<div class="absolute -bottom-1 left-0 w-full h-8 bg-background-light dark:bg-background-dark rounded-t-[2rem] z-10"></div>
</header>
<!-- Main Content -->
<main class="px-6 pb-28 -mt-4 relative z-20">
<!-- Title Block -->
<div class="flex justify-between items-start mb-6">
<div>
<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1">
                        Spicy Miso Ramen
                    </h1>
<div class="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
<span class="material-icons text-primary text-base mr-1">location_on</span>
<span>Ramen Nagi, Tokyo</span>
</div>
</div>
<div class="flex flex-col items-center">
<div class="bg-primary text-white font-bold text-xl px-4 py-2 rounded-xl shadow-lg shadow-primary/30 flex items-center gap-1">
<span>9.2</span>
<span class="material-icons text-sm opacity-80">star</span>
</div>
<span class="text-xs text-primary font-semibold mt-1 tracking-wide uppercase">Excellent</span>
</div>
</div>
<!-- Tags -->
<div class="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
<span class="px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wide whitespace-nowrap">Spicy</span>
<span class="px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wide whitespace-nowrap">Pork Broth</span>
<span class="px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wide whitespace-nowrap">Dinner</span>
</div>
<!-- AI Summary Section -->
<div class="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent p-6 rounded-[2rem] border border-primary/10 dark:border-primary/20 mb-8 relative overflow-hidden">
<!-- Decorative Icon Background -->
<span class="material-icons absolute -top-4 -right-4 text-9xl text-primary/5 dark:text-primary/10 rotate-12 pointer-events-none">auto_awesome</span>
<div class="flex items-center gap-2 mb-3 relative z-10">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
<span class="material-icons text-white text-sm">auto_awesome</span>
</div>
<h3 class="font-bold text-primary dark:text-orange-400 text-lg">TasteRank AI Verdict</h3>
</div>
<p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed relative z-10">
<span class="font-semibold text-gray-900 dark:text-white">A crowd favorite!</span> The broth is described as rich and creamy, specifically hitting high marks for depth of flavor. While <span class="text-primary font-medium">Jeff</span> noted it was saltier than expected, the pork belly was universally praised for being incredibly tender.
                </p>
</div>
<!-- Reviews Header -->
<div class="flex items-center justify-between mb-4">
<h2 class="text-xl font-bold text-gray-900 dark:text-white">Member Reviews</h2>
<button class="text-primary text-sm font-bold hover:text-orange-600 transition-colors">See All (12)</button>
</div>
<!-- Review List -->
<div class="space-y-4">
<!-- Review Card 1 -->
<div class="bg-white dark:bg-[#2a2018] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
<div class="flex justify-between items-start mb-3">
<div class="flex items-center gap-3">
<img alt="Jeff Avatar" class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" data-alt="Portrait of a smiling man with glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_43TUqsXNHfOgfUBF_WBswIXaeJHMrSai0_l2n33_qxvtKbeOtUPxVIONtV4wVHdbk30SFsF0Z6qdO5jVIgnCadOqSF3HWN9QKW5KSl5h8ItEbjUoEVJiOXszoSSw16o_5-wvEP08E1Uebvsaa452eIuI7ISbdKx2bMRmCkH26ux1_u95rRiwDiLZL-Mcvg-RvJfgPF9ok5oMHVpLgZUQZGB4n2Twh8ZjN3mnPUn-RVVt2OFv7QrGhrPqpaiEZJ_CkItF57-BCGQ"/>
<div>
<h4 class="font-bold text-gray-900 dark:text-white text-sm">Jeff</h4>
<p class="text-xs text-gray-400">2 days ago</p>
</div>
</div>
<div class="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
<span class="material-icons text-green-600 dark:text-green-400 text-xs">star</span>
<span class="text-sm font-bold text-green-700 dark:text-green-400">9.0</span>
</div>
</div>
<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        Best noodles I've had on this trip. The texture was perfect—chewy but firm.
                    </p>
</div>
<!-- Review Card 2 -->
<div class="bg-white dark:bg-[#2a2018] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
<div class="flex justify-between items-start mb-3">
<div class="flex items-center gap-3">
<img alt="Sarah Avatar" class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" data-alt="Portrait of a woman smiling outdoors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqwGz4I0rdFDM9rqWCQV59uwbeVBHWtfImZILcYhuttq0ClCXeqNdz0Q6MuLHXGCEuGQsbDC9YIJnhLsKLk577aYCj6aGBgd_5VzOfz1K2Ma3L7tPRq4QFvfOaIly33N8Y-6KR6fi1m-bsdKSynCwrZkMcLBJ0volBjAt2j1CqohV7fxAaZthoTcOmuuXRn7-1kMrYKS8Bj0Iw9pUYn5UMY6cxQrv7nOMS9RCmXT-bwQDlGV0pofqbRDMrCMlrEcoAWeJ9eN_bFSU"/>
<div>
<h4 class="font-bold text-gray-900 dark:text-white text-sm">Sarah</h4>
<p class="text-xs text-gray-400">2 days ago</p>
</div>
</div>
<div class="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
<span class="material-icons text-orange-500 dark:text-orange-400 text-xs">star</span>
<span class="text-sm font-bold text-orange-600 dark:text-orange-400">8.5</span>
</div>
</div>
<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        Great flavor, slightly too salty for my taste but the egg was cooked perfectly.
                    </p>
</div>
<!-- Review Card 3 -->
<div class="bg-white dark:bg-[#2a2018] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
<div class="flex justify-between items-start mb-3">
<div class="flex items-center gap-3">
<img alt="Mike Avatar" class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" data-alt="Portrait of a young man with a beard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzOx6ybUSrhRdwHPVfHQm6ora5MCUpIsRTSB2Kgf79Cew_Axhm4r2emq6wrrGDGD16t8QIA6bAKSh2P-6uXqfpyCbl0aryFy3Z1FLAn01eT-9zNGbwHP-xthxHqLnxFaH95IdgQenbrCAvkCFB4C_zqkksxdJ_2QbVRZ4ZD_F8wiaqgjNMQ46nS3coTvX47lThZGQhJQBbMMbaH1LY9JIFEuu3_j2vUFEVLc6kDgyc8k9gUd_nstb-ABBuTjhSM2bniw1dBBo0Zgs"/>
<div>
<h4 class="font-bold text-gray-900 dark:text-white text-sm">Mike</h4>
<p class="text-xs text-gray-400">3 days ago</p>
</div>
</div>
<div class="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
<span class="material-icons text-green-600 dark:text-green-400 text-xs">star</span>
<span class="text-sm font-bold text-green-700 dark:text-green-400">9.5</span>
</div>
</div>
<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        Perfection in a bowl. I could eat this every single day.
                    </p>
</div>
</div>
</main>
<!-- Floating Action Button / Bottom Bar -->
<div class="fixed bottom-6 left-0 w-full px-6 z-30 pointer-events-none max-w-md mx-auto left-0 right-0">
<div class="pointer-events-auto flex items-center justify-between gap-4 p-2 bg-white/90 dark:bg-[#2a2018]/90 backdrop-blur-lg rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-black/50 border border-gray-100 dark:border-white/5">
<button class="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-transform active:scale-95">
<span class="material-icons text-xl">map</span>
</button>
<button class="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-95">
<span class="material-icons text-xl">edit</span>
<span>Add Review</span>
</button>
</div>
</div>
</div>
</body></html>

<!-- Food World Cup Tournament -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>TasteRank: Food World Cup</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec7f13",
                        "primary-dark": "#d66a00", 
                        "background-light": "#f8f7f6",
                        "background-dark": "#221910",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hide */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white h-screen overflow-hidden flex flex-col items-center justify-center">
<!-- Mobile Container -->
<div class="w-full max-w-md h-full max-h-[900px] flex flex-col relative bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
<!-- Progress & Header -->
<header class="absolute top-0 left-0 right-0 z-30 px-6 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
<div class="flex items-center justify-between text-white mb-3">
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
<span class="material-icons text-xl">close</span>
</button>
<div class="flex flex-col items-center">
<span class="text-xs font-bold tracking-wider uppercase opacity-90">TasteRank World Cup</span>
<span class="text-lg font-extrabold text-primary drop-shadow-md">Round of 16</span>
</div>
<div class="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                    1/8
                </div>
</div>
<!-- Segmented Progress Bar -->
<div class="flex gap-1 h-1.5 w-full">
<div class="flex-1 bg-primary rounded-full shadow-[0_0_10px_rgba(236,127,19,0.5)]"></div>
<div class="flex-1 bg-white/30 rounded-full"></div>
<div class="flex-1 bg-white/30 rounded-full"></div>
<div class="flex-1 bg-white/30 rounded-full"></div>
<div class="flex-1 bg-white/30 rounded-full"></div>
<div class="flex-1 bg-white/30 rounded-full"></div>
<div class="flex-1 bg-white/30 rounded-full"></div>
<div class="flex-1 bg-white/30 rounded-full"></div>
</div>
</header>
<!-- Battle Area -->
<main class="flex-1 flex flex-col relative">
<!-- Option 1 (Top) -->
<div class="group relative flex-1 w-full cursor-pointer overflow-hidden transition-all duration-300 hover:flex-[1.1] active:scale-[0.98]">
<img alt="Neapolitan Pizza with basil and tomato sauce" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Close up of a delicious Neapolitan pizza" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc_cmz4WbsJ0oP2HAxB95sy6P71ervNzXucrsr-XRdwcyhbaAsVW_lWN_T3TDoUvUezCphKUi1_FD8lNwj3kI-26e4ws6gHAcLmh7KyRsBy9xewxdiAbdERFE8KJiJVshJH6CNC_NJPhWei5ahEFhaQ1CjsLZu88gXj6Lg_sqoyqMSQgF3uUz3JqhvGAuuVKMBDbbq6BV5QEFsiLwRf3vDqG5C1QWOCdrUx3QzsUgBBfMl6cldumG8tn0iToIEOZ-HjHzoTZF4EPI"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
<!-- Content -->
<div class="absolute bottom-16 left-0 right-0 p-6 flex items-end justify-between">
<div>
<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold mb-2 backdrop-blur-sm shadow-sm">
<span class="material-icons text-[14px]">flag</span> Italy
                        </div>
<h2 class="text-3xl font-extrabold text-white leading-tight drop-shadow-lg">Neapolitan Pizza</h2>
</div>
<button class="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
<span class="material-icons">check</span>
</button>
</div>
<!-- Hover Overlay Effect -->
<div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"></div>
</div>
<!-- VS Badge (Center Absolute) -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
<div class="w-16 h-16 rounded-full bg-white dark:bg-background-dark p-1 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
<div class="w-full h-full rounded-full bg-primary flex items-center justify-center border-4 border-white dark:border-background-dark">
<span class="text-xl font-black text-white italic tracking-tighter transform -skew-x-6">VS</span>
</div>
</div>
</div>
<!-- Option 2 (Bottom) -->
<div class="group relative flex-1 w-full cursor-pointer overflow-hidden transition-all duration-300 hover:flex-[1.1] active:scale-[0.98]">
<img alt="Platter of assorted sushi rolls" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Fresh sushi rolls arranged on a wooden board" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi6Cc1QeGU8ZwSdD113GakH9Y_sz6tGUQI3P24tNobHS6MrXMlI4HOlNoXUPnQWHd2RY0Y19OiUTd43Y3xkP0PlCm1tr_2S5ER1crkk895HfZJlU-kBdPMSncwQpNr6N_SF02fzj_flPR2YjCLY6QiLPIFJXNQ74GPyuiUkDMfdD94JhipkqLXSjup7M4C67NOxsfLP6N--0v-84_SNjdN-xOYwb9aaah1EMDFLFsNgkR1JtexPSBVrCCsPo45ks7ly1iFRkMVlQo"/>
<div class="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent rotate-180"></div>
<!-- Content -->
<div class="absolute top-16 left-0 right-0 p-6 flex items-start justify-between">
<div>
<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-2 border border-white/10">
<span class="material-icons text-[14px]">flag</span> Japan
                        </div>
<h2 class="text-3xl font-extrabold text-white leading-tight drop-shadow-lg">Omakase Sushi</h2>
</div>
<button class="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg transform -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
<span class="material-icons">check</span>
</button>
</div>
<!-- Hover Overlay Effect -->
<div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"></div>
</div>
</main>
<!-- Winner Overlay (Hidden by default, shown for demo structure) -->
<!-- To visualize, remove 'hidden' class -->
<div class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex-col items-center justify-center p-6">
<div class="bg-background-light dark:bg-background-dark w-full max-w-sm rounded-[2.5rem] p-2 shadow-2xl overflow-hidden relative animate-[scaleIn_0.4s_ease-out]">
<!-- Confetti Background (simulated with dots) -->
<div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
<div class="absolute top-10 left-10 w-3 h-3 bg-primary rounded-full opacity-60"></div>
<div class="absolute top-20 right-20 w-2 h-2 bg-yellow-400 rounded-full opacity-80"></div>
<div class="absolute bottom-32 left-1/2 w-4 h-4 bg-primary rounded-full opacity-40"></div>
</div>
<div class="relative rounded-[2rem] overflow-hidden aspect-[4/5] group">
<img alt="Winning dish: Neapolitan Pizza" class="w-full h-full object-cover" data-alt="Winning dish Neapolitan Pizza" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvkvuYKc7HthsPkM95vyQkoP2gtlihwaPemgbPZbv3Szdhwbz9mOrLi_gjgoQCleiAX31Tzqq6Omq53S3IFHBCIOUfcl5qPqlZWCxeLqFQKlhgwb8asjOJ6Un6hkafvVc7uUl0uaVKoaWCsPKU0JIK_2bvk8ujvEM4LFoI8G0HF-nDnoIIILcWceaMsQbAr0EEhQQ2gOajI7bFCRCrNUjW8qJw5y4zPX0P1U8HyjQl5RFbr9XRF-ZTmr3Y0_KqrhHACLWZ44jSRiU"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
<div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 text-white border border-white/20">
<span class="material-icons text-yellow-400 text-sm">star</span>
<span class="text-xs font-bold">#1 Choice</span>
</div>
<div class="absolute bottom-0 left-0 right-0 p-6 text-center">
<div class="inline-block px-4 py-1 rounded-full bg-primary text-white text-xs font-bold tracking-widest uppercase mb-3 shadow-lg shadow-primary/40">
                            Champion
                        </div>
<h2 class="text-3xl font-extrabold text-white mb-2">Neapolitan Pizza</h2>
<p class="text-white/80 text-sm mb-6">Chosen by 12,403 travelers</p>
</div>
</div>
<div class="p-6">
<button class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
<span class="material-icons">share</span> Share Result
                    </button>
<button class="w-full mt-3 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 font-bold py-3 rounded-xl transition-colors text-sm">
                        Back to Ranking
                    </button>
</div>
</div>
</div>
<!-- Hint / Tooltip -->
<div class="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-20">
<div class="bg-black/40 backdrop-blur-md text-white text-xs font-medium px-4 py-2 rounded-full border border-white/10 shadow-lg animate-pulse">
                Tap your favorite to advance
            </div>
</div>
</div>
<script>
        // Simple scale in animation for winner modal
        tailwind.config.theme.extend.keyframes = {
            ...tailwind.config.theme.extend.keyframes,
            scaleIn: {
                '0%': { transform: 'scale(0.9)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' },
            }
        }
    </script>
</body></html>
