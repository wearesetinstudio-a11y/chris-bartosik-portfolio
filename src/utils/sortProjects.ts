type ProjectEntry = {
	id: string;
	data: {
		order: number;
		client?: string;
		comingSoon?: boolean;
	};
};

export function sortProjects<T extends ProjectEntry>(projects: T[]): T[] {
	return [...projects].sort((a, b) => {
		const aComingSoon = a.data.comingSoon === true;
		const bComingSoon = b.data.comingSoon === true;

		if (aComingSoon !== bComingSoon) {
			return aComingSoon ? 1 : -1;
		}

		if (a.data.order !== b.data.order) {
			return a.data.order - b.data.order;
		}

		return a.id.localeCompare(b.id);
	});
}
