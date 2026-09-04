type ProjectEntry = {
	id: string;
	data: {
		order: number;
		client?: string;
		comingSoon?: boolean;
	};
};

const PHOTOAID_CLIENT = 'photoaid';

function isPhotoAidProject(project: ProjectEntry): boolean {
	const client = (project.data.client ?? '').trim().toLowerCase();
	const id = project.id.trim().toLowerCase();
	return client === PHOTOAID_CLIENT || id.startsWith('photoaid');
}

export function sortProjects<T extends ProjectEntry>(projects: T[]): T[] {
	return [...projects].sort((a, b) => {
		const aComingSoon = a.data.comingSoon === true;
		const bComingSoon = b.data.comingSoon === true;

		if (aComingSoon !== bComingSoon) {
			return aComingSoon ? 1 : -1;
		}

		const aPhotoAid = isPhotoAidProject(a);
		const bPhotoAid = isPhotoAidProject(b);

		if (aPhotoAid !== bPhotoAid) {
			return aPhotoAid ? -1 : 1;
		}

		if (a.data.order !== b.data.order) {
			return a.data.order - b.data.order;
		}

		return a.id.localeCompare(b.id);
	});
}
