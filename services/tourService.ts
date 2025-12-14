
export const tourService = {
    // Check if the user has seen the tour
    // Güncelleme: Yeni mobil tasarım için key değiştirildi (v2)
    hasSeenTour: (): boolean => {
        return !!localStorage.getItem('mv_tour_seen_mobile_v2');
    },

    // Mark the tour as seen
    completeTour: (): void => {
        localStorage.setItem('mv_tour_seen_mobile_v2', 'true');
    },

    // Reset tour state (useful for debugging or "Show Again" button)
    resetTour: (): void => {
        localStorage.removeItem('mv_tour_seen_mobile_v2');
        window.location.reload();
    }
};