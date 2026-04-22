<<<<<<< HEAD
category and todo to perfectly work kar rahe hai But ek bug hain isme jab main category ko re-order krun and phir jo category re-order hui hai usme agar me us card me ke kisi bh todo kuch action perform krun to card ki position chnage ho rhi wo again re-order ho raha hai kuch glitch issue hai isme ya koi refresnce ka issue hai



const handleCategoryDragEnd = useCallback(
  async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeRaw = String(active.id).replace("cat-", "");
    const overRaw = String(over.id).replace("cat-", "");

    if (!String(over.id).startsWith("cat-")) return;

    const latest = [...latestContainersRef.current];

    const oldIndex = latest.findIndex((c) => String(c.id) === activeRaw);
    const newIndex = latest.findIndex((c) => String(c.id) === overRaw);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(latest, oldIndex, newIndex);

    // ✅ UI update
    setContainers(reordered);
    latestContainersRef.current = reordered;

    // ✅ 🔥 CRITICAL FIX (missing piece)
    latestCategoriesRef.current = reordered.map((cat, index) => ({
      id: cat.id,
      category: cat.title,
      position: index,
    }));

    try {
      const items = reordered.map((cat, index) => ({
        id: Number(cat.id),
        position: index,
      }));

      await updateCategoriesBulk(items);
    } catch (err) {
      console.error("Category bulk update failed", err);
    }
  },
  []
);
=======
2  bar email bhejne par ek bar jaa rhi hai
>>>>>>> parent of 822411f (solve todo bulk issue)
