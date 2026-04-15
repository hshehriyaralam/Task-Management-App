
Error  : 
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.



like Trello behaviour 

1. 🧠 Optimistic UI Update (Sabse important)   || Done 
2. 📦 Batch API Calls (Har drag pe request nahi) || Done 
3. ⏳ Debouncing / Throttling
4. 🔄 Only Position Change Send karo (Full Data nahi)
5. 🧩 Floating Position System (Smart Trick)
6. 🔌 WebSockets / Realtime Sync
7. 🛑 Rollback Mechanism (Error Handle)
hello ai 



isme kuch bug hai jab ek bug solve krun dosra bug aa jayega 

1) kabh ayesa ho raha hai ke jab ek tdod drop kar ke refresh krun to wo reverse aa raha hai 

because maine bulk me update kiya hai to bohat sare todo drop karne se DB update ho rhi hai lekin kabh ek todo drop krne se after refresh wo return aa raha hai ek scenario ye bh hai jab me ek todo drop kr ke wait krun 1 minute uske bad page refresh krun to wo reverse nahi ho raha hai 





2) 




// Important Issue 
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
