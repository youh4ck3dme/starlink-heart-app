import { useRive } from "@rive-app/react-canvas";

type Props = {
  className?: string;
  /** názov state machine (default: "main") */
  stateMachine?: string;
  /** cesta k .riv v /public */
  src?: string;
};

export default function RiveMascot({
  className,
  stateMachine,
  src = "/animations/starry.riv",
}: Props) {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
  });

  // If Rive fails to load, show fallback emoji
  if (!RiveComponent) {
    return (
      <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "3rem" }}>✨</span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <RiveComponent style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
