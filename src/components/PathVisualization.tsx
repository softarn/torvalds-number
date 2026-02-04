import { PathStep } from '@/lib/types';
import DeveloperNode from './DeveloperNode';
import RepositoryNode from './RepositoryNode';

interface PathVisualizationProps {
    path: PathStep[];
}

function VerticalConnector() {
    return (
        <div className="flex justify-center h-8">
            <div className="w-[2px] bg-gradient-to-b from-gray-600 via-blue-500 to-gray-600" />
        </div>
    );
}

export default function PathVisualization({ path }: PathVisualizationProps) {
    return (
        <div className="flex flex-col w-full max-w-xl mx-auto">
            {path.map((step, index) => {
                const isStart = index === 0;
                const isEnd = index === path.length - 1;

                return (
                    <div key={index}>
                        {index > 0 && <VerticalConnector />}

                        {step.type === 'developer' && step.developer && (
                            <DeveloperNode
                                developer={step.developer}
                                facts={step.facts}
                                isStart={isStart}
                                isEnd={isEnd}
                            />
                        )}

                        {step.type === 'repository' && step.repository && (
                            <RepositoryNode repository={step.repository} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
