'use client'

export default function KawaiiBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.7; }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(-8deg); opacity: 0.6; }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.35; }
          50% { transform: translateY(-15px) scale(1.1); opacity: 0.6; }
        }
        @keyframes drift {
          0%, 100% { transform: translateX(0px) translateY(0px); opacity: 0.2; }
          33% { transform: translateX(10px) translateY(-15px); opacity: 0.5; }
          66% { transform: translateX(-8px) translateY(-25px); opacity: 0.3; }
        }
        .kawaii-1 { animation: float1 6s ease-in-out infinite; }
        .kawaii-2 { animation: float2 8s ease-in-out infinite; }
        .kawaii-3 { animation: float3 7s ease-in-out infinite; }
        .kawaii-4 { animation: drift 10s ease-in-out infinite; }
        .kawaii-5 { animation: float1 9s ease-in-out infinite reverse; }
        .kawaii-6 { animation: float2 5s ease-in-out infinite; }
      `}</style>

      {/* Blob 1 — top left */}
      <div
        className="kawaii-1 absolute -top-20 -left-20 h-72 w-72 rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
      />

      {/* Blob 2 — top right */}
      <div
        className="kawaii-2 absolute -top-10 right-10 h-96 w-96 rounded-full opacity-15"
        style={{
          background:
            'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        }}
      />

      {/* Blob 3 — bottom left */}
      <div
        className="kawaii-3 absolute bottom-20 -left-10 h-64 w-64 rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
      />

      {/* Blob 4 — bottom right */}
      <div
        className="kawaii-5 absolute right-20 -bottom-10 h-80 w-80 rounded-full opacity-15"
        style={{
          background:
            'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        }}
      />

      {/* Floating symbols */}
      <span
        className="kawaii-1 absolute top-[15%] left-[10%] text-3xl opacity-20"
        style={{ color: 'var(--accent)' }}
      >
        ✦
      </span>
      <span
        className="kawaii-2 absolute top-[25%] right-[12%] text-2xl opacity-20"
        style={{ color: 'var(--accent)' }}
      >
        ♥
      </span>
      <span
        className="kawaii-3 absolute top-[50%] left-[5%] text-xl opacity-15"
        style={{ color: 'var(--accent)' }}
      >
        ✧
      </span>
      <span
        className="kawaii-4 absolute top-[60%] right-[8%] text-3xl opacity-20"
        style={{ color: 'var(--accent)' }}
      >
        ✦
      </span>
      <span
        className="kawaii-5 absolute top-[80%] left-[20%] text-2xl opacity-15"
        style={{ color: 'var(--accent)' }}
      >
        ♥
      </span>
      <span
        className="kawaii-6 absolute top-[35%] right-[25%] text-lg opacity-20"
        style={{ color: 'var(--accent)' }}
      >
        ✿
      </span>
      <span
        className="kawaii-1 absolute top-[70%] right-[30%] text-xl opacity-15"
        style={{ color: 'var(--accent)' }}
      >
        ✧
      </span>
      <span
        className="kawaii-2 absolute top-[10%] left-[40%] text-2xl opacity-15"
        style={{ color: 'var(--accent)' }}
      >
        ✿
      </span>
      <span
        className="kawaii-3 absolute top-[45%] left-[30%] text-lg opacity-10"
        style={{ color: 'var(--accent)' }}
      >
        ♥
      </span>
      <span
        className="kawaii-4 absolute top-[88%] right-[15%] text-xl opacity-15"
        style={{ color: 'var(--accent)' }}
      >
        ✦
      </span>
    </div>
  )
}
