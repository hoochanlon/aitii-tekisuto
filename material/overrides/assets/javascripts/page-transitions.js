/**
 * 页面过渡动画脚本
 * 处理页面切换和加载时的平滑过渡效果
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // 标记内容已加载
    const contentInner = document.querySelector('.md-content__inner');
    if (contentInner) {
      // 延迟一帧添加loaded类，确保动画生效
      requestAnimationFrame(() => {
        contentInner.classList.add('loaded');
      });
    }

    // 处理页面内链接点击（MkDocs Material的instant navigation）
    handleNavigation();
    
    // 处理浏览器前进/后退
    window.addEventListener('popstate', handlePageChange);
  }

  function handleNavigation() {
    // 监听所有内部链接点击
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      
      // 只处理内部链接
      if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:')) {
        // 如果是MkDocs Material的instant navigation，监听其事件
        if (window.MkDocsMaterial && window.MkDocsMaterial.navigation) {
          // 在导航开始前添加过渡类
          document.body.classList.add('page-transitioning');
          
          // 监听导航完成事件
          document.addEventListener('navigation:complete', function onNavComplete() {
            document.body.classList.remove('page-transitioning');
            // 重新初始化内容动画
            setTimeout(() => {
              const newContent = document.querySelector('.md-content__inner');
              if (newContent) {
                newContent.classList.remove('loaded');
                requestAnimationFrame(() => {
                  newContent.classList.add('loaded');
                });
              }
            }, 50);
            document.removeEventListener('navigation:complete', onNavComplete);
          }, { once: true });
        } else {
          // 如果没有instant navigation，使用传统方式
          handlePageChange();
        }
      }
    });
  }

  function handlePageChange() {
    const contentInner = document.querySelector('.md-content__inner');
    if (contentInner) {
      // 移除loaded类，准备重新动画
      contentInner.classList.remove('loaded');
      
      // 等待内容更新后重新添加动画
      setTimeout(() => {
        requestAnimationFrame(() => {
          contentInner.classList.add('loaded');
        });
      }, 100);
    }
  }

  // 监听MkDocs Material的导航事件（如果可用）
  if (window.MkDocsMaterial) {
    // 监听导航开始
    document.addEventListener('navigation:start', function() {
      document.body.classList.add('page-transitioning');
    });

    // 监听导航完成
    document.addEventListener('navigation:complete', function() {
      document.body.classList.remove('page-transitioning');
      
      // 重新初始化内容动画
      setTimeout(() => {
        const contentInner = document.querySelector('.md-content__inner');
        if (contentInner) {
          contentInner.classList.remove('loaded');
          requestAnimationFrame(() => {
            contentInner.classList.add('loaded');
          });
        }
      }, 50);
    });
  }

  // 处理页面刷新
  window.addEventListener('beforeunload', function() {
    document.body.classList.add('page-transitioning');
  });

  // 页面可见性变化时（切换标签页后回来）
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      const contentInner = document.querySelector('.md-content__inner');
      if (contentInner) {
        contentInner.classList.remove('loaded');
        requestAnimationFrame(() => {
          contentInner.classList.add('loaded');
        });
      }
    }
  });
})();
