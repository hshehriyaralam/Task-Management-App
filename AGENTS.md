Todo action me sab chezien preftecly realtime update ho rhi hai 
isme feature implement kiya hai maine board sharing like trello 
isme sab functionlity almost thek chal rhi hai
Add todo, get todo, update todo, add card , delete card 
delete todo, todo reoder aand drag and drop , card re-order 


Issue :
Suppose 3 cards hai today index[0], month index[1] , year index[2] 
jab main today ko re-order krun for example index 0 se 1 kar dun month ki jaga kr dun today ko month ki jaga and month ko today ki jaga re-order bh perfectly ho rahe hain and realtime DB me update bh ho rhe hain ... 

lekin after re-order jab main dono me se kisi bh card me kuch bh action perform krun like add todo, delete todo , todo drag drop , todo edit  to viewer page jo card maine re-order kiya hai wo return apni purani position ma  ajata hai viewer page me  after refresh again wo thek ho raha hai but ye sirf viewer page me ho raha hai owner page me return nahi aa raha 

