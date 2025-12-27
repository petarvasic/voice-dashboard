=> (
                      <ClipCard key={clip.id || i} clip={clip} />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>✨ Svi klipovi završeni</p>
                )}
              </GlassCard>
            </div>
          </div>

          <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            Powered by <strong>VOICE</strong>
            {lastUpdate && <span> • Ažurirano: {lastUpdate.toLocaleTimeString('sr-RS')}</span>}
          </footer>
        </main>
      </div>
      
      {selectedInfluencer && (
        <InfluencerDrawer influencer={selectedInfluencer} campaign={selectedCampaign} onClose={() => { setSelectedInfluencer(null); setSelectedCampaign(null); }} />
      )}
      
      <AddPackageModal
        isOpen={showAddPackageModal}
        onClose={() => setShowAddPackageModal(false)}
        onSubmit={handleAddPackage}
        campaigns={(data?.months || []).filter(c => {
          if (!c.startDate) return false;
          const now = new Date();
          const start = new Date(c.startDate);
          if (start > now) return false;
          if (c.endDate) {
            const end = new Date(c.endDate.split('/').reverse().join('-'));
            if (end < new Date(now.getFullYear(), now.getMonth(), 1)) return false;
          }
          return true;
        })}
      />
    </>
  );
}
